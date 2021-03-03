import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// providers
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { Logger } from '../../../../providers/logger/logger';
// pages
import { ImportWalletPage } from '../../../add/import-wallet/import-wallet';
let ClearEncryptPasswordPage = class ClearEncryptPasswordPage {
    constructor(logger, navParams, navCtrl, externalLinkProvider) {
        this.logger = logger;
        this.navParams = navParams;
        this.navCtrl = navCtrl;
        this.externalLinkProvider = externalLinkProvider;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: ClearEncryptPasswordPage');
    }
    reImportWallets() {
        this.navCtrl.push(ImportWalletPage, { keyId: this.navParams.data.keyId });
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
};
ClearEncryptPasswordPage = __decorate([
    Component({
        selector: 'page-clear-encrypt-password',
        templateUrl: 'clear-encrypt-password.html'
    }),
    __metadata("design:paramtypes", [Logger,
        NavParams,
        NavController,
        ExternalLinkProvider])
], ClearEncryptPasswordPage);
export { ClearEncryptPasswordPage };
//# sourceMappingURL=clear-encrypt-password.js.map