import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// providers
import { BitPayAccountProvider } from '../../../../providers/bitpay-account/bitpay-account';
import { BitPayCardProvider } from '../../../../providers/bitpay-card/bitpay-card';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { PopupProvider } from '../../../../providers/popup/popup';
import { ScanProvider } from '../../../../providers/scan/scan';
// pages
import { IABCardProvider, PersistenceProvider, ProfileProvider } from '../../../../providers';
import { BitPayCardPage } from '../bitpay-card';
let BitPayCardIntroPage = class BitPayCardIntroPage {
    constructor(translate, actionSheetCtrl, navParams, bitPayAccountProvider, popupProvider, bitPayCardProvider, navCtrl, externalLinkProvider, persistenceProvider, iabCardProvider, profileProvider, scanProvider) {
        this.translate = translate;
        this.actionSheetCtrl = actionSheetCtrl;
        this.navParams = navParams;
        this.bitPayAccountProvider = bitPayAccountProvider;
        this.popupProvider = popupProvider;
        this.bitPayCardProvider = bitPayCardProvider;
        this.navCtrl = navCtrl;
        this.externalLinkProvider = externalLinkProvider;
        this.persistenceProvider = persistenceProvider;
        this.iabCardProvider = iabCardProvider;
        this.profileProvider = profileProvider;
        this.scanProvider = scanProvider;
        this.scannerHasPermission = false;
        this.updateCapabilities();
        this.persistenceProvider.getCardExperimentFlag().then(status => {
            this.cardExperimentEnabled = status === 'enabled';
        });
    }
    ionViewWillEnter() {
        if (this.navParams.data.secret) {
            let pairData = {
                secret: this.navParams.data.secret,
                email: this.navParams.data.email,
                otp: this.navParams.data.otp
            };
            let pairingReason = this.translate.instant('add your Omega Visa card(s)');
            this.bitPayAccountProvider.pair(pairData, pairingReason, (err, paired, apiContext) => {
                if (err) {
                    this.popupProvider.ionicAlert(this.translate.instant('Error pairing Omega Account'), err);
                    return;
                }
                if (paired) {
                    this.bitPayCardProvider.sync(apiContext, (err, cards) => {
                        if (err) {
                            this.popupProvider.ionicAlert(this.translate.instant('Error updating Debit Cards'), err);
                            return;
                        }
                        // Fixes mobile navigation
                        setTimeout(() => {
                            if (cards[0]) {
                                this.navCtrl
                                    .push(BitPayCardPage, { id: cards[0].id }, { animate: false })
                                    .then(() => {
                                    let previousView = this.navCtrl.getPrevious();
                                    this.navCtrl.removeView(previousView);
                                });
                            }
                        }, 200);
                    });
                }
            });
        }
        this.bitPayAccountProvider.getAccounts((err, accounts) => {
            if (err) {
                this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
                return;
            }
            this.accounts = accounts;
        });
        if (!this.scannerHasPermission) {
            this.authorizeCamera();
        }
    }
    ionViewDidEnter() {
        this.iabCardProvider.updateWalletStatus();
        this.bitPayCardProvider.logEvent('legacycard_view_setup', {});
        this.ready = true;
    }
    updateCapabilities() {
        const capabilities = this.scanProvider.getCapabilities();
        this.scannerHasPermission = capabilities.hasPermission;
    }
    authorizeCamera() {
        this.scanProvider
            .initialize() // prompt for authorization by initializing scanner
            .then(() => this.scanProvider.pausePreview()) // release camera resources from scanner
            .then(() => this.updateCapabilities()); // update component state
    }
    openExchangeRates() {
        let url = 'https://bitpay.com/exchange-rates';
        this.externalLinkProvider.open(url);
    }
    bitPayCardInfo() {
        let url = 'https://bitpay.com/visa/faq';
        this.externalLinkProvider.open(url);
    }
    orderBitPayCard() {
        return __awaiter(this, void 0, void 0, function* () {
            this.iabCardProvider.loadingWrapper(() => __awaiter(this, void 0, void 0, function* () {
                const hasWalletWithFunds = this.profileProvider.hasWalletWithFunds(12, 'USD');
                const hasFirstView = yield this.iabCardProvider.hasFirstView();
                if (!hasWalletWithFunds && !hasFirstView) {
                    this.iabCardProvider.show();
                    this.iabCardProvider.sendMessage({
                        message: 'needFunds'
                    }, () => { });
                    return;
                }
                this.iabCardProvider.show();
                this.iabCardProvider.sendMessage({
                    message: 'orderCard'
                }, () => { });
                setTimeout(() => {
                    this.navCtrl.pop();
                }, 300);
            }));
        });
    }
    connectBitPayCard() {
        this.bitPayCardProvider.logEvent('legacycard_connect', {});
        if (this.accounts.length == 0) {
            this.startPairBitPayAccount();
        }
        else {
            this.showAccountSelector();
        }
    }
    startPairBitPayAccount() {
        this.navCtrl.popToRoot({ animate: false }); // Back to Root
        let url = 'https://bitpay.com/visa/dashboard/add-to-bitpay-wallet-confirm';
        this.externalLinkProvider.open(url);
    }
    showAccountSelector() {
        let options = [];
        _.forEach(this.accounts, account => {
            options.push({
                text: (account.givenName || account.familyName) +
                    ' (' +
                    account.email +
                    ')',
                handler: () => {
                    this.onAccountSelect(account);
                }
            });
        });
        // Add account
        options.push({
            text: this.translate.instant('Add account'),
            handler: () => {
                this.onAccountSelect();
            }
        });
        // Cancel
        options.push({
            text: this.translate.instant('Cancel'),
            role: 'cancel'
        });
        let actionSheet = this.actionSheetCtrl.create({
            title: this.translate.instant('From Omega Account'),
            buttons: options
        });
        actionSheet.present();
    }
    onAccountSelect(account) {
        if (_.isUndefined(account)) {
            this.startPairBitPayAccount();
        }
        else {
            this.bitPayCardProvider.sync(account.apiContext, err => {
                if (err) {
                    this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
                    return;
                }
                this.navCtrl.pop();
            });
        }
    }
};
BitPayCardIntroPage = __decorate([
    Component({
        selector: 'page-bitpay-card-intro',
        templateUrl: 'bitpay-card-intro.html',
        providers: [ScanProvider]
    }),
    __metadata("design:paramtypes", [TranslateService,
        ActionSheetController,
        NavParams,
        BitPayAccountProvider,
        PopupProvider,
        BitPayCardProvider,
        NavController,
        ExternalLinkProvider,
        PersistenceProvider,
        IABCardProvider,
        ProfileProvider,
        ScanProvider])
], BitPayCardIntroPage);
export { BitPayCardIntroPage };
//# sourceMappingURL=bitpay-card-intro.js.map