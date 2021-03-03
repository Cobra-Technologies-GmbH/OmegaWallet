import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
// Providers
import { CurrencyProvider, Logger } from '../../../providers';
let CoinSelectorPage = class CoinSelectorPage {
    constructor(currencyProvider, logger, viewCtrl, navParams) {
        this.currencyProvider = currencyProvider;
        this.logger = logger;
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.logger.debug('Coin selector initialized;');
        this.description = this.navParams.data.description;
        this.availableChains = this.currencyProvider.getAvailableChains();
    }
    getCoinName(coin) {
        return this.currencyProvider.getCoinName(coin);
    }
    selectedCoin(coin) {
        this.viewCtrl.dismiss({
            selectedCoin: coin
        });
    }
};
CoinSelectorPage = __decorate([
    Component({
        selector: 'page-coin-selector',
        templateUrl: 'coin-selector.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        Logger,
        ViewController,
        NavParams])
], CoinSelectorPage);
export { CoinSelectorPage };
//# sourceMappingURL=coin-selector.js.map