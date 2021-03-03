import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';
import * as _ from 'lodash';
// providers
import { ActionSheetProvider } from '../../../../providers/action-sheet/action-sheet';
import { CoinbaseProvider } from '../../../../providers/coinbase/coinbase';
import { IncomingDataProvider } from '../../../../providers/incoming-data/incoming-data';
import { OnGoingProcessProvider } from '../../../../providers/on-going-process/on-going-process';
import { PopupProvider } from '../../../../providers/popup/popup';
import { ProfileProvider } from '../../../../providers/profile/profile';
import { ThemeProvider } from '../../../../providers/theme/theme';
// Page
import { AmountPage } from '../../../send/amount/amount';
import { CoinbaseTxDetailsPage } from '../coinbase-tx-details/coinbase-tx-details';
const TIMEOUT_FOR_REFRESHER = 1000;
let CoinbaseAccountPage = class CoinbaseAccountPage {
    constructor(actionSheetProvider, coinbase, logger, popupProvider, navCtrl, navParams, modalCtrl, profileProvider, translate, incomingDataProvider, themeProvider, onGoingProcessProvider) {
        this.actionSheetProvider = actionSheetProvider;
        this.coinbase = coinbase;
        this.logger = logger;
        this.popupProvider = popupProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.modalCtrl = modalCtrl;
        this.profileProvider = profileProvider;
        this.translate = translate;
        this.incomingDataProvider = incomingDataProvider;
        this.themeProvider = themeProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.data = {};
        this.debounceUpdateAll = _.debounce(() => __awaiter(this, void 0, void 0, function* () {
            this.updateAll();
        }), 5000, {
            leading: true
        });
        this.zone = new NgZone({ enableLongStackTrace: false });
        this.id = this.navParams.data.id;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CoinbaseAccountPage');
    }
    ionViewWillEnter() {
        this.backgroundColor = this.themeProvider.getThemeInfo().walletDetailsBackgroundStart;
        this.updateAll();
    }
    updateAll() {
        this.zone.run(() => {
            this.nativeCurrency = this.coinbase.coinbaseData['user']['native_currency'];
            this.coinbase.getAccount(this.id, this.data);
            this.coinbase.getTransactions(this.id, this.data);
        });
    }
    doRefresh(refresher) {
        this.debounceUpdateAll();
        setTimeout(() => {
            refresher.complete();
        }, TIMEOUT_FOR_REFRESHER);
    }
    showErrorAndBack(err) {
        this.logger.error(err);
        err = err.errors ? err.errors[0].message : err;
        this.popupProvider
            .ionicAlert(this.translate.instant('Error'), err)
            .then(() => {
            this.navCtrl.pop();
        });
    }
    showError(err) {
        this.logger.error(err);
        err = err.errors ? err.errors[0].message : err;
        this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
    }
    getNativeBalance() {
        if (!this.data['account'])
            return null;
        return this.coinbase.getNativeCurrencyBalance(this.data['account'].balance.amount, this.data['account'].balance.currency);
    }
    openTx(tx) {
        let modal = this.modalCtrl.create(CoinbaseTxDetailsPage, { tx });
        modal.present();
    }
    deposit() {
        const account_name = this.data['account'].name;
        const coin = this.data['account'].currency.code.toLowerCase();
        const wallets = this.profileProvider.getWallets({
            onlyComplete: true,
            network: 'livenet',
            hasFunds: true,
            coin
        });
        if (_.isEmpty(wallets)) {
            this.showError(this.translate.instant('No wallet available to deposit'));
            return;
        }
        const params = {
            wallets,
            selectedWalletId: null,
            title: this.translate.instant('Transfer from')
        };
        const walletSelector = this.actionSheetProvider.createWalletSelector(params);
        walletSelector.present();
        walletSelector.onDidDismiss(fromWallet => {
            if (!fromWallet)
                return;
            this.onGoingProcessProvider.set('generatingNewAddress');
            this.coinbase
                .getAddress(this.id, this.translate.instant('Transfer from Omega') +
                ': ' +
                fromWallet.name)
                .then(data => {
                let toAddress = data.address;
                let destinationTag;
                if (coin == 'xrp' || coin == 'bch') {
                    toAddress = this.incomingDataProvider.extractAddress(data.deposit_uri);
                    const tagParam = /[\?\&]dt=(\d+([\,\.]\d+)?)/i;
                    if (tagParam.exec(data.deposit_uri)) {
                        destinationTag = tagParam.exec(data.deposit_uri)[1];
                    }
                }
                this.onGoingProcessProvider.clear();
                this.navCtrl.push(AmountPage, {
                    alternativeCurrency: this.nativeCurrency,
                    coin,
                    walletId: fromWallet.id,
                    fromWalletDetails: true,
                    toAddress,
                    destinationTag,
                    description: this.translate.instant('Deposit to') + ': ' + account_name,
                    recipientType: 'coinbase',
                    fromCoinbase: { accountId: this.id, accountName: account_name }
                });
            });
        });
    }
    withdraw() {
        const coin = this.data['account'].currency.code.toLowerCase();
        const wallets = this.profileProvider.getWallets({
            onlyComplete: true,
            backedUp: true,
            network: 'livenet',
            coin
        });
        if (_.isEmpty(wallets)) {
            this.showError(this.translate.instant('No wallet available to withdraw'));
            return;
        }
        const params = {
            wallets,
            selectedWalletId: null,
            title: this.translate.instant('Transfer to')
        };
        const walletSelector = this.actionSheetProvider.createWalletSelector(params);
        walletSelector.present();
        walletSelector.onDidDismiss(toWallet => {
            if (!toWallet)
                return;
            this.navCtrl.push(AmountPage, {
                id: this.id,
                toWalletId: toWallet.id,
                alternativeCurrency: this.nativeCurrency,
                coin,
                nextPage: 'CoinbaseWithdrawPage',
                description: this.translate.instant('Transfer to Omega') + ': ' + toWallet.name
            });
        });
    }
};
CoinbaseAccountPage = __decorate([
    Component({
        selector: 'page-coinbase-account',
        templateUrl: 'coinbase-account.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        CoinbaseProvider,
        Logger,
        PopupProvider,
        NavController,
        NavParams,
        ModalController,
        ProfileProvider,
        TranslateService,
        IncomingDataProvider,
        ThemeProvider,
        OnGoingProcessProvider])
], CoinbaseAccountPage);
export { CoinbaseAccountPage };
//# sourceMappingURL=coinbase-account.js.map