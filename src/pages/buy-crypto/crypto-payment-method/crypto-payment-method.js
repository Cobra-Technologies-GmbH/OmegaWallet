import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'lodash';
// Providers
import { BuyCryptoProvider } from '../../../providers/buy-crypto/buy-crypto';
import { Logger } from '../../../providers/logger/logger';
import { ThemeProvider } from '../../../providers/theme/theme';
// Pages
import { CryptoOrderSummaryPage } from '../../../pages/buy-crypto/crypto-order-summary/crypto-order-summary';
let CryptoPaymentMethodPage = class CryptoPaymentMethodPage {
    constructor(logger, navParams, navCtrl, viewCtrl, buyCryptoProvider, themeProvider) {
        this.logger = logger;
        this.navParams = navParams;
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.buyCryptoProvider = buyCryptoProvider;
        this.themeProvider = themeProvider;
        this.coin = this.navParams.data.coin;
        this.country = this.navParams.data.selectedCountry;
        this.currency = this.navParams.data.currency;
        this.methods = this.buyCryptoProvider.paymentMethodsAvailable;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CryptoPaymentMethodPage');
        this.methods = _.pickBy(this.methods, m => {
            return (m.enabled &&
                (this.buyCryptoProvider.isPaymentMethodSupported('simplex', m, this.coin, this.currency) ||
                    this.buyCryptoProvider.isPaymentMethodSupported('wyre', m, this.coin, this.currency)) &&
                (m.method != 'sepaBankTransfer' ||
                    (m.method == 'sepaBankTransfer' && this.country.EUCountry)));
        });
    }
    ionViewWillEnter() {
        this.useAsModal = this.navParams.data.useAsModal;
        if (!this.methodSelected)
            this.methodSelected = this.navParams.data.paymentMethod || 'creditCard';
    }
    showExchange(exchange, paymentMethod) {
        return this.buyCryptoProvider.isPaymentMethodSupported(exchange, paymentMethod, this.coin, this.currency);
    }
    goToOrderSummary() {
        const params = {
            coin: this.coin,
            currency: this.currency,
            network: this.navParams.data.network,
            walletId: this.navParams.data.walletId,
            paymentMethod: this.methods[this.methodSelected],
            amount: this.navParams.data.amount
        };
        this.navCtrl.push(CryptoOrderSummaryPage, params);
    }
    close() {
        this.viewCtrl.dismiss();
    }
    save() {
        if (!this.useAsModal ||
            !this.methodSelected ||
            this.navParams.data.paymentMethod == this.methodSelected)
            return;
        this.viewCtrl.dismiss({ paymentMethod: this.methods[this.methodSelected] });
    }
};
CryptoPaymentMethodPage = __decorate([
    Component({
        selector: 'page-crypto-payment-method',
        templateUrl: 'crypto-payment-method.html'
    }),
    __metadata("design:paramtypes", [Logger,
        NavParams,
        NavController,
        ViewController,
        BuyCryptoProvider,
        ThemeProvider])
], CryptoPaymentMethodPage);
export { CryptoPaymentMethodPage };
//# sourceMappingURL=crypto-payment-method.js.map