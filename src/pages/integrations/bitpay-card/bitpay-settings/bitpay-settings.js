import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ActionSheetController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// Providers
import { TranslateService } from '@ngx-translate/core';
import { BitPayAccountProvider } from '../../../../providers/bitpay-account/bitpay-account';
import { BitPayCardProvider } from '../../../../providers/bitpay-card/bitpay-card';
import { ConfigProvider } from '../../../../providers/config/config';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { HomeIntegrationsProvider } from '../../../../providers/home-integrations/home-integrations';
import { PopupProvider } from '../../../../providers/popup/popup';
let BitPaySettingsPage = class BitPaySettingsPage {
    constructor(navParams, navCtrl, bitpayAccountProvider, bitPayCardProvider, popupProvider, configProvider, translate, homeIntegrationsProvider, actionSheetCtrl, externalLinkProvider) {
        this.navParams = navParams;
        this.navCtrl = navCtrl;
        this.bitpayAccountProvider = bitpayAccountProvider;
        this.bitPayCardProvider = bitPayCardProvider;
        this.popupProvider = popupProvider;
        this.configProvider = configProvider;
        this.translate = translate;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.actionSheetCtrl = actionSheetCtrl;
        this.externalLinkProvider = externalLinkProvider;
        this.serviceName = 'debitcard';
        this.service = _.filter(this.homeIntegrationsProvider.get(), {
            name: this.serviceName
        });
        this.showAtHome = !!this.service[0].show;
    }
    ionViewWillEnter() {
        let cardId = this.navParams.data.id;
        if (cardId) {
            this.bitPayCardProvider.getCards(cards => {
                this.bitpayCard = _.find(cards, { id: cardId });
            });
        }
        else {
            this.service = _.filter(this.homeIntegrationsProvider.get(), {
                name: this.serviceName
            });
            this.showAtHome = !!this.service[0].show;
        }
        this.bitpayAccountProvider.getAccounts((err, accounts) => {
            if (err) {
                this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
                return;
            }
            this.accounts = accounts;
        });
    }
    integrationChange() {
        let opts = {
            showIntegration: { [this.serviceName]: this.showAtHome }
        };
        this.homeIntegrationsProvider.updateConfig(this.serviceName, this.showAtHome);
        this.configProvider.set(opts);
    }
    unlinkCard(card) {
        let title = 'Unlink Omega Card?';
        let msg = 'Are you sure you would like to remove your Omega Card (' +
            card.lastFourDigits +
            ') from this device?';
        this.popupProvider.ionicConfirm(title, msg).then(res => {
            if (res) {
                this.bitPayCardProvider.remove(card.id, err => {
                    if (err) {
                        this.popupProvider.ionicAlert('Error', 'Could not remove the card');
                        return;
                    }
                    this.navCtrl.pop();
                });
            }
        });
    }
    unlinkAccount(card) {
        let title = 'Unlink Omega Account?';
        let msg = 'Are you sure you would like to remove your Omega Account (' +
            card.email +
            ') and all associated cards from this device?';
        this.popupProvider.ionicConfirm(title, msg).then(res => {
            if (res) {
                this.bitpayAccountProvider.removeAccount(card.email, () => {
                    this.navCtrl.pop();
                });
            }
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
    startPairBitPayAccount() {
        this.navCtrl.popToRoot({ animate: false }); // Back to Root
        let url = 'https://bitpay.com/visa/dashboard/add-to-bitpay-wallet-confirm';
        this.externalLinkProvider.open(url);
    }
};
BitPaySettingsPage = __decorate([
    Component({
        selector: 'page-bitpay-settings',
        templateUrl: 'bitpay-settings.html'
    }),
    __metadata("design:paramtypes", [NavParams,
        NavController,
        BitPayAccountProvider,
        BitPayCardProvider,
        PopupProvider,
        ConfigProvider,
        TranslateService,
        HomeIntegrationsProvider,
        ActionSheetController,
        ExternalLinkProvider])
], BitPaySettingsPage);
export { BitPaySettingsPage };
//# sourceMappingURL=bitpay-settings.js.map