import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';
// Provider
import { CurrencyProvider, IncomingDataProvider } from '../../../../providers';
let SelectInvoicePage = class SelectInvoicePage {
    constructor(currencyProvider, incomingDataProvider, logger, navParams) {
        this.currencyProvider = currencyProvider;
        this.incomingDataProvider = incomingDataProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.paymentOptions = this.navParams.data.payProOptions.paymentOptions
            .reverse()
            .sort(a => (a.disabled ? 1 : -1));
        this.payProUrl = this.navParams.data.payProOptions.payProUrl;
        this.hasWallets = this.navParams.data.hasWallets;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: SelectInvoicePage');
    }
    getCoinName(currency) {
        const coin = currency.toLowerCase();
        return this.currencyProvider.getCoinName(coin);
    }
    goToPayPro(currency) {
        const coin = currency.toLowerCase();
        if (this.navParams.data.walletCardRedir) {
            this.payProUrl += '?redir=wc';
        }
        this.incomingDataProvider.goToPayPro(this.payProUrl, coin, this.navParams.data.payProOptions);
    }
};
SelectInvoicePage = __decorate([
    Component({
        selector: 'select-invoice-page',
        templateUrl: 'select-invoice.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        IncomingDataProvider,
        Logger,
        NavParams])
], SelectInvoicePage);
export { SelectInvoicePage };
//# sourceMappingURL=select-invoice.js.map