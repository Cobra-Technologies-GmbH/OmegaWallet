import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { CurrencyProvider } from '../../../providers/currency/currency';
import { Logger } from '../../../providers/logger/logger';
let WalletBalanceModal = class WalletBalanceModal {
    constructor(currencyProvider, logger, navParams, viewCtrl) {
        this.currencyProvider = currencyProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.status = this.navParams.data.status;
        this.coinName = this.currencyProvider.getCoinName(this.status.wallet.coin);
    }
    ionViewDidLoad() {
        this.logger.info('Loaded:  WalletBalanceModal');
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
WalletBalanceModal = __decorate([
    Component({
        selector: 'page-wallet-balance',
        templateUrl: 'wallet-balance.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        Logger,
        NavParams,
        ViewController])
], WalletBalanceModal);
export { WalletBalanceModal };
//# sourceMappingURL=wallet-balance.js.map