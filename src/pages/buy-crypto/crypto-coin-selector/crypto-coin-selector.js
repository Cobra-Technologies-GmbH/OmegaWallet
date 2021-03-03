import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'lodash';
import env from '../../../environments';
// Providers
import { ActionSheetProvider, BuyCryptoProvider, CurrencyProvider, ErrorsProvider, Logger, ProfileProvider } from '../../../providers';
// Pages
import { SelectCurrencyPage } from '../../../pages/add/select-currency/select-currency';
import { RecoveryKeyPage } from '../../../pages/onboarding/recovery-key/recovery-key';
let CryptoCoinSelectorPage = class CryptoCoinSelectorPage {
    constructor(actionSheetProvider, buyCryptoProvider, logger, navCtrl, viewCtrl, profileProvider, currencyProvider, translate, errorsProvider, navParams) {
        this.actionSheetProvider = actionSheetProvider;
        this.buyCryptoProvider = buyCryptoProvider;
        this.logger = logger;
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.profileProvider = profileProvider;
        this.currencyProvider = currencyProvider;
        this.translate = translate;
        this.errorsProvider = errorsProvider;
        this.navParams = navParams;
        this.coins = [];
        const supportedCoins = this.buyCryptoProvider.exchangeCoinsSupported;
        this.wallets = this.profileProvider.getWallets({
            network: env.name == 'development' ? null : 'livenet',
            onlyComplete: true,
            coin: supportedCoins,
            backedUp: true
        });
        for (const coin of supportedCoins) {
            const c = {
                unitCode: coin,
                name: this.currencyProvider.getCoinName(coin),
                availableWallets: _.filter(this.wallets, w => w.coin === coin)
            };
            this.coins.push(c);
        }
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CryptoCoinSelectorPage');
    }
    ionViewWillEnter() {
        this.useAsModal = this.navParams.data.useAsModal;
        if (this.navParams.data.coin) {
            const coin = _.find(this.coins, ['unitCode', this.navParams.data.coin]);
            this.showWallets(coin);
        }
    }
    showWallets(coin) {
        const wallets = coin.availableWallets;
        if (_.isEmpty(wallets)) {
            this.errorsProvider.showNoWalletError(coin.unitCode.toUpperCase(), option => {
                if (option) {
                    this.navCtrl.push(SelectCurrencyPage);
                }
            });
        }
        else {
            const params = {
                wallets,
                selectedWalletId: null,
                title: this.translate.instant('Select wallet to deposit to')
            };
            const walletSelector = this.actionSheetProvider.createWalletSelector(params);
            walletSelector.present();
            walletSelector.onDidDismiss(wallet => {
                if (wallet && wallet.needsBackup) {
                    const infoSheet = this.actionSheetProvider.createInfoSheet('key-verification-required');
                    infoSheet.present();
                    infoSheet.onDidDismiss(option => {
                        if (option) {
                            this.navCtrl.push(RecoveryKeyPage, {
                                keyId: wallet.keyId
                            });
                        }
                    });
                }
                else {
                    this.onWalletSelect(wallet);
                }
            });
        }
    }
    onWalletSelect(wallet) {
        if (!_.isEmpty(wallet)) {
            this.wallet = wallet;
            this.save();
        }
    }
    close() {
        this.viewCtrl.dismiss();
    }
    save() {
        this.viewCtrl.dismiss({ coin: this.wallet.coin, walletId: this.wallet.id });
    }
};
CryptoCoinSelectorPage = __decorate([
    Component({
        selector: 'page-crypto-coin-selector',
        templateUrl: 'crypto-coin-selector.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        BuyCryptoProvider,
        Logger,
        NavController,
        ViewController,
        ProfileProvider,
        CurrencyProvider,
        TranslateService,
        ErrorsProvider,
        NavParams])
], CryptoCoinSelectorPage);
export { CryptoCoinSelectorPage };
//# sourceMappingURL=crypto-coin-selector.js.map