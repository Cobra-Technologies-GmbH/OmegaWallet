import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import { BwcProvider } from '../bwc/bwc';
import { ConfigProvider } from '../config/config';
import { Coin, CurrencyProvider } from '../currency/currency';
import { FilterProvider } from '../filter/filter';
import { RateProvider } from '../rate/rate';
import * as _ from 'lodash';
let TxFormatProvider = class TxFormatProvider {
    constructor(bwcProvider, rate, configProvider, currencyProvider, filter, logger) {
        this.bwcProvider = bwcProvider;
        this.rate = rate;
        this.configProvider = configProvider;
        this.currencyProvider = currencyProvider;
        this.filter = filter;
        this.logger = logger;
        this.logger.debug('TxFormatProvider initialized');
        this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    }
    toCashAddress(address, withPrefix) {
        return this.bitcoreCash.Address(address).toString(!withPrefix);
    }
    toLegacyAddress(address) {
        let legacyAddr = this.bitcoreCash
            .Address(address)
            .toLegacyAddress();
        return legacyAddr;
    }
    // TODO: Check return of formatAmount(...), sometimes returns a number and sometimes a string
    formatAmount(coin, satoshis, fullPrecision) {
        if (coin == 'sat')
            return satoshis;
        // TODO : now only works for english, specify opts to change thousand separator and decimal separator
        var opts = {
            fullPrecision: !!fullPrecision
        };
        return this.bwcProvider.getUtils().formatAmount(satoshis, coin, opts);
    }
    formatAmountStr(coin, satoshis, fullPrecision) {
        if (isNaN(satoshis))
            return undefined;
        return (this.formatAmount(coin, satoshis, fullPrecision) +
            ' ' +
            coin.toUpperCase());
    }
    toFiat(coin, satoshis, code, opts) {
        // TODO not a promise
        return new Promise(resolve => {
            if (isNaN(satoshis))
                return resolve();
            var v1;
            v1 = this.rate.toFiat(satoshis, code, coin, opts);
            if (!v1)
                return resolve(null);
            return resolve(v1.toFixed(2));
        });
    }
    formatToUSD(coin, satoshis) {
        // TODO not a promise
        return new Promise(resolve => {
            let v1;
            if (isNaN(satoshis))
                return resolve();
            v1 = this.rate.toFiat(satoshis, 'USD', coin);
            if (!v1)
                return resolve(null);
            return resolve(v1.toFixed(2));
        });
    }
    formatAlternativeStr(coin, satoshis) {
        if (isNaN(satoshis))
            return undefined;
        let settings = this.configProvider.get().wallet.settings;
        let val = (() => {
            var v1 = parseFloat(this.rate.toFiat(satoshis, settings.alternativeIsoCode, coin).toFixed(2));
            v1 = this.filter.formatFiatAmount(v1);
            if (!v1)
                return null;
            return v1 + ' ' + settings.alternativeIsoCode;
        }).bind(this);
        if (!this.rate.isCoinAvailable(coin))
            return null;
        return val();
    }
    processTx(coin, tx) {
        if (!tx || tx.action == 'invalid')
            return tx;
        // New transaction output format. Fill tx.amount and tx.toAmount for
        // backward compatibility.
        if (tx.outputs && tx.outputs.length) {
            var outputsNr = tx.outputs.length;
            if (tx.action != 'received') {
                if (outputsNr > 1) {
                    tx.recipientCount = outputsNr;
                    tx.hasMultiplesOutputs = true;
                }
                tx.amount = _.reduce(tx.outputs, (total, o) => {
                    o.amountStr = this.formatAmountStr(coin, o.amount);
                    o.alternativeAmountStr = this.formatAlternativeStr(coin, o.amount);
                    return total + o.amount;
                }, 0);
            }
            tx.toAddress = tx.outputs[0].toAddress;
            // toDo: translate all tx.outputs[x].toAddress ?
            if (tx.toAddress && coin == 'bch') {
                tx.toAddress = this.toCashAddress(tx.toAddress);
            }
        }
        // Old tx format. Fill .output, for forward compatibility
        if (!tx.outputs) {
            tx.outputs = [
                {
                    address: tx.toAddress,
                    amount: tx.amount
                }
            ];
        }
        tx.amountStr = this.formatAmountStr(coin, tx.amount);
        tx.alternativeAmountStr = this.formatAlternativeStr(coin, tx.amount);
        const chain = this.currencyProvider.getChain(coin).toLowerCase();
        tx.feeStr = tx.fee
            ? this.formatAmountStr(chain, tx.fee)
            : tx.fees
                ? this.formatAmountStr(chain, tx.fees)
                : 'N/A';
        if (tx.amountStr) {
            tx.amountValueStr = tx.amountStr.split(' ')[0];
            tx.amountUnitStr = tx.amountStr.split(' ')[1];
        }
        if (tx.size && (tx.fee || tx.fees) && tx.amountUnitStr)
            tx.feeRate = `${((tx.fee || tx.fees) / tx.size).toFixed(0)} sat/byte`;
        if (tx.addressTo && coin == 'bch') {
            tx.addressTo = this.toCashAddress(tx.addressTo);
        }
        return tx;
    }
    parseAmount(coin, amount, currency, opts) {
        const { alternativeIsoCode } = this.configProvider.get().wallet.settings;
        const { unitToSatoshi, unitDecimals } = this.currencyProvider.getPrecision(coin);
        const satToUnit = 1 / unitToSatoshi;
        let amountUnitStr;
        let amountSat;
        // If fiat currency
        if (!Coin[currency] && currency != 'sat') {
            let formattedAmount = opts && opts.onlyIntegers
                ? this.filter.formatFiatAmount(amount.toFixed(0))
                : this.filter.formatFiatAmount(amount);
            amountUnitStr = formattedAmount + ' ' + currency;
            amountSat = Number(this.rate.fromFiat(amount, currency, coin, opts).toFixed(0));
        }
        else if (currency == 'sat') {
            amountSat = Number(amount);
            amountUnitStr = this.formatAmountStr(coin, amountSat);
            // convert sat to Coin
            amount = (amountSat * satToUnit).toFixed(unitDecimals);
            currency = coin.toUpperCase();
        }
        else {
            amountSat = parseInt((amount * unitToSatoshi).toFixed(0), 10);
            amountUnitStr = this.formatAmountStr(coin, amountSat);
            // convert unit to Coin
            amount = (amountSat * satToUnit).toFixed(unitDecimals);
            currency = coin.toUpperCase();
        }
        return {
            amount,
            currency,
            alternativeIsoCode,
            amountSat,
            amountUnitStr
        };
    }
    satToUnit(amount, coin) {
        let { unitToSatoshi, unitDecimals } = this.currencyProvider.getPrecision(coin);
        let satToUnit = 1 / unitToSatoshi;
        return parseFloat((amount * satToUnit).toFixed(unitDecimals));
    }
};
TxFormatProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [BwcProvider,
        RateProvider,
        ConfigProvider,
        CurrencyProvider,
        FilterProvider,
        Logger])
], TxFormatProvider);
export { TxFormatProvider };
//# sourceMappingURL=tx-format.js.map