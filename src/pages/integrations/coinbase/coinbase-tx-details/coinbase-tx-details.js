import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { ConfigProvider } from '../../../../providers/config/config';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
let CoinbaseTxDetailsPage = class CoinbaseTxDetailsPage {
    constructor(viewCtrl, navParams, configProvider, externalLinkProvider, translate) {
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.configProvider = configProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.translate = translate;
        this.tx = this.navParams.data.tx;
    }
    viewOnBlockchain() {
        const defaults = this.configProvider.getDefaults();
        const blockexplorerUrl = defaults.blockExplorerUrl[this.tx.amount.currency.toLowerCase()];
        const btx = this.tx;
        const network = 'mainnet/';
        const url = `https://${blockexplorerUrl}${network}tx/${btx.network.hash}`;
        const optIn = true;
        const title = null;
        const message = this.translate.instant('View Transaction');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
CoinbaseTxDetailsPage = __decorate([
    Component({
        selector: 'page-coinbase-tx-details',
        templateUrl: 'coinbase-tx-details.html'
    }),
    __metadata("design:paramtypes", [ViewController,
        NavParams,
        ConfigProvider,
        ExternalLinkProvider,
        TranslateService])
], CoinbaseTxDetailsPage);
export { CoinbaseTxDetailsPage };
//# sourceMappingURL=coinbase-tx-details.js.map