import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
import * as _ from 'lodash';
import { PricePage } from '../../pages/home/price-page/price-page';
import { ConfigProvider, CurrencyProvider, Logger } from '../../providers';
import { DateRanges, RateProvider } from '../../providers/rate/rate';
let ExchangeRates = class ExchangeRates {
    constructor(navCtrl, currencyProvider, rateProvider, configProvider, logger, events) {
        this.navCtrl = navCtrl;
        this.currencyProvider = currencyProvider;
        this.rateProvider = rateProvider;
        this.configProvider = configProvider;
        this.logger = logger;
        this.events = events;
        this.coins = [];
        const availableChains = this.currencyProvider.getAvailableChains();
        for (const coin of availableChains) {
            const { backgroundColor, gradientBackgroundColor } = this.currencyProvider.getTheme(coin);
            const card = {
                unitCode: coin,
                historicalRates: [],
                currentPrice: 0,
                totalBalanceChange: 0,
                totalBalanceChangeAmount: 0,
                backgroundColor,
                gradientBackgroundColor,
                name: this.currencyProvider.getCoinName(coin)
            };
            this.coins.push(card);
        }
        this.getPrices();
        this.events.subscribe('Local/PriceUpdate', () => {
            this.getPrices();
        });
    }
    goToPricePage(card) {
        this.navCtrl.push(PricePage, { card });
    }
    getPrices() {
        this.setIsoCode();
        // TODO: Add a new endpoint in BWS that
        // provides JUST  the current prices and the delta.
        this.rateProvider
            .fetchHistoricalRates(this.fiatIsoCode, DateRanges.Day)
            .then(response => {
            _.forEach(this.coins, (coin, index) => {
                if (response[coin.unitCode])
                    this.update(index, response[coin.unitCode]);
            });
            err => {
                this.logger.error('Error getting rates:', err);
            };
        });
    }
    update(i, values) {
        if (!values[0] || !_.last(values)) {
            this.logger.warn('No exchange rate data');
            return;
        }
        const lastRate = _.last(values).rate;
        this.coins[i].currentPrice = values[0].rate;
        this.coins[i].totalBalanceChangeAmount =
            this.coins[i].currentPrice - lastRate;
        this.coins[i].totalBalanceChange =
            (this.coins[i].totalBalanceChangeAmount * 100) / lastRate;
    }
    setIsoCode() {
        const alternativeIsoCode = this.configProvider.get().wallet.settings
            .alternativeIsoCode;
        this.isFiatIsoCodeSupported = this.rateProvider.isAltCurrencyAvailable(alternativeIsoCode);
        this.fiatIsoCode = this.isFiatIsoCodeSupported ? alternativeIsoCode : 'USD';
    }
    getDigitsInfo(coin) {
        switch (coin) {
            case 'xrp':
                return '1.4-4';
            default:
                return '1.2-2';
        }
    }
};
ExchangeRates = __decorate([
    Component({
        selector: 'exchange-rates',
        templateUrl: 'exchange-rates.html'
    }),
    __metadata("design:paramtypes", [NavController,
        CurrencyProvider,
        RateProvider,
        ConfigProvider,
        Logger,
        Events])
], ExchangeRates);
export { ExchangeRates };
//# sourceMappingURL=exchange-rates.js.map