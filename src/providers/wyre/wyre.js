import { __decorate, __metadata } from "tslib";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import env from '../../environments';
// providers
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';
import { RateProvider } from '../rate/rate';
const URI_DEV = 'https://api.testwyre.com';
const URI_PROD = 'https://api.sendwyre.com';
let WyreProvider = class WyreProvider {
    constructor(http, logger, persistenceProvider, rateProvider) {
        this.http = http;
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.rateProvider = rateProvider;
        this.env = env.name == 'development' ? 'sandbox' : 'production';
        this.logger.debug('WyreProvider initialized - env: ' + this.env);
        this.uri = env.name == 'development' ? URI_DEV : URI_PROD;
        this.supportedFiatAltCurrencies = ['AUD', 'CAD', 'EUR', 'GBP', 'USD'];
        this.supportedCoins = [
            'btc',
            'eth',
            'usdc',
            'gusd',
            'pax',
            'busd',
            'dai',
            'wbtc'
        ];
        this.fiatAmountLimits = {
            min: 1,
            max: 1000
        };
    }
    getSupportedFiatAltCurrencies() {
        return this.supportedFiatAltCurrencies;
    }
    getRates() {
        const url = this.uri + '/v3/rates';
        const headers = {
            'Content-Type': 'application/json'
        };
        // as: DIVISOR, MULTIPLIER, or PRICED
        const params = new HttpParams().set('as', 'PRICED');
        return new Promise((resolve, reject) => {
            this.http.get(url, { headers, params }).subscribe(data => {
                return resolve(data);
            }, err => {
                return reject(err);
            });
        });
    }
    getCountries() {
        const url = this.uri + '/v3/widget/countries';
        const headers = {
            'Content-Type': 'application/json'
        };
        return new Promise((resolve, reject) => {
            this.http.get(url, { headers }).subscribe(data => {
                return resolve(data);
            }, err => {
                return reject(err);
            });
        });
    }
    getFiatCurrencyLimits(fiatCurrency, coin, country) {
        let min, max;
        if (!country || country != 'US') {
            min = 1;
            max = 1000;
        }
        else {
            min = 1;
            max = 500;
        }
        this.fiatAmountLimits.min = this.calculateFiatRate(min, fiatCurrency, coin);
        this.fiatAmountLimits.max = this.calculateFiatRate(max, fiatCurrency, coin);
        return this.fiatAmountLimits;
    }
    calculateFiatRate(amount, fiatCurrency, cryptoCurrency) {
        if (_.includes(['USD'], fiatCurrency)) {
            return amount;
        }
        const rateFromFiat = this.rateProvider.fromFiat(amount, 'USD', cryptoCurrency);
        return +this.rateProvider
            .toFiat(rateFromFiat, fiatCurrency, cryptoCurrency)
            .toFixed(2);
    }
    getLimits() {
        const url = this.uri + '/v3/limits';
        const headers = {
            'Content-Type': 'application/json'
        };
        return new Promise((resolve, reject) => {
            this.http.get(url, { headers }).subscribe(data => {
                return resolve(data);
            }, err => {
                return reject(err);
            });
        });
    }
    walletOrderQuotation(wallet, data) {
        data.env = this.env;
        return wallet.wyreWalletOrderQuotation(data);
    }
    walletOrderReservation(wallet, data) {
        data.env = this.env;
        return wallet.wyreWalletOrderReservation(data);
    }
    getWyreUrlParams(wallet) {
        const data = {
            env: this.env
        };
        return wallet.wyreUrlParams(data);
    }
    getTransfer(transferId) {
        const url = this.uri + '/v2/transfer/' + transferId + '/track';
        const headers = {
            'Content-Type': 'application/json'
        };
        return new Promise((resolve, reject) => {
            this.http.get(url, { headers }).subscribe(data => {
                return resolve(data);
            }, err => {
                return reject(err);
            });
        });
    }
    saveWyre(data, opts) {
        const env = this.env;
        data.created_on = Date.now();
        return this.persistenceProvider.getWyre(env).then(oldData => {
            if (_.isString(oldData)) {
                oldData = JSON.parse(oldData);
            }
            if (_.isString(data)) {
                data = JSON.parse(data);
            }
            let inv = oldData ? oldData : {};
            inv[data.transferId] = data;
            if (opts && (opts.error || opts.status)) {
                inv[data.transferId] = _.assign(inv[data.transferId], opts);
            }
            if (opts && opts.remove) {
                delete inv[data.transferId];
            }
            inv = JSON.stringify(inv);
            this.persistenceProvider.setWyre(env, inv);
            return Promise.resolve();
        });
    }
    getWyre() {
        const env = this.env;
        return this.persistenceProvider.getWyre(env);
    }
};
WyreProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        Logger,
        PersistenceProvider,
        RateProvider])
], WyreProvider);
export { WyreProvider };
//# sourceMappingURL=wyre.js.map