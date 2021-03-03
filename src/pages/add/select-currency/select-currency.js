import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// pages
import { ImportWalletPage } from '../../add/import-wallet/import-wallet';
import { RecoveryKeyPage } from '../../onboarding/recovery-key/recovery-key';
import { KeyOnboardingPage } from '../../settings/key-settings/key-onboarding/key-onboarding';
import { CreateWalletPage } from '../create-wallet/create-wallet';
import { JoinWalletPage } from '../join-wallet/join-wallet';
// providers
import { ActionSheetProvider, BwcErrorProvider, ErrorsProvider, Logger, OnGoingProcessProvider, PersistenceProvider, ProfileProvider, PushNotificationsProvider, WalletProvider } from '../../../providers';
import { CurrencyProvider } from '../../../providers/currency/currency';
let SelectCurrencyPage = class SelectCurrencyPage {
    constructor(actionSheetProvider, currencyProvider, navCtrl, logger, navParam, profileProvider, onGoingProcessProvider, walletProvider, pushNotificationsProvider, bwcErrorProvider, translate, modalCtrl, persistenceProvider, errorsProvider, events) {
        this.actionSheetProvider = actionSheetProvider;
        this.currencyProvider = currencyProvider;
        this.navCtrl = navCtrl;
        this.logger = logger;
        this.navParam = navParam;
        this.profileProvider = profileProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.walletProvider = walletProvider;
        this.pushNotificationsProvider = pushNotificationsProvider;
        this.bwcErrorProvider = bwcErrorProvider;
        this.translate = translate;
        this.modalCtrl = modalCtrl;
        this.persistenceProvider = persistenceProvider;
        this.errorsProvider = errorsProvider;
        this.events = events;
        this.coinsSelected = {};
        this.tokensSelected = {};
        this.tokenDisabled = {};
        this.isJoin = this.navParam.data.isJoin;
        this.isShared = this.navParam.data.isShared;
        this.keyId = this.navParam.data.keyId;
        this.availableChains =
            this.isShared || this.isJoin
                ? this.currencyProvider.getMultiSigCoins()
                : this.currencyProvider.getAvailableChains();
        this.availableTokens = this.currencyProvider.getAvailableTokens();
        for (const chain of this.availableChains) {
            this.coinsSelected[chain] = true;
        }
        this.shouldShowKeyOnboarding();
        this.setTokens();
    }
    ionViewWillEnter() {
        const previousView = this.navCtrl.getPrevious();
        if (this.isOnboardingFlow && previousView.name === 'LockMethodPage') {
            this.navCtrl.removeView(previousView);
        }
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: SelectCurrencyPage');
        this.isOnboardingFlow = this.navParam.data.isOnboardingFlow;
        this.isZeroState = this.navParam.data.isZeroState;
        this.title = this.isZeroState
            ? this.translate.instant('Select Currencies')
            : this.translate.instant('Select Currency');
    }
    shouldShowKeyOnboarding() {
        this.persistenceProvider.getKeyOnboardingFlag().then(value => {
            if (!value) {
                this.showKeyOnboarding = true;
                const wallets = this.profileProvider.getWallets();
                const walletsGroups = _.values(_.groupBy(wallets, 'keyId'));
                walletsGroups.forEach((walletsGroup) => {
                    if (walletsGroup[0].canAddNewAccount)
                        this.showKeyOnboarding = false;
                });
            }
            else {
                this.showKeyOnboarding = false;
            }
        });
    }
    showKeyOnboardingSlides(coins) {
        this.logger.debug('Showing key onboarding');
        const modal = this.modalCtrl.create(KeyOnboardingPage, null, {
            showBackdrop: false,
            enableBackdropDismiss: false
        });
        modal.present();
        modal.onDidDismiss(() => {
            this.persistenceProvider.setKeyOnboardingFlag();
            this._createWallets(coins);
        });
    }
    goToCreateWallet(coin) {
        if (this.isJoin) {
            this.navCtrl.push(JoinWalletPage, {
                keyId: this.keyId,
                url: this.navParam.data.url,
                coin
            });
        }
        else {
            this.navCtrl.push(CreateWalletPage, {
                isShared: this.isShared,
                coin,
                keyId: this.keyId,
                showKeyOnboarding: this.showKeyOnboarding
            });
        }
    }
    getCoinName(coin) {
        return this.currencyProvider.getCoinName(coin);
    }
    goToImportWallet() {
        this.navCtrl.push(ImportWalletPage);
    }
    _createWallets(coins) {
        const selectedCoins = _.keys(_.pickBy(this.coinsSelected));
        coins = coins || selectedCoins;
        const selectedTokens = _.keys(_.pickBy(this.tokensSelected));
        this.onGoingProcessProvider.set('creatingWallet');
        this.profileProvider
            .createMultipleWallets(coins, selectedTokens)
            .then((wallets) => __awaiter(this, void 0, void 0, function* () {
            this.walletProvider.updateRemotePreferences(wallets);
            this.pushNotificationsProvider.updateSubscription(wallets);
            yield new Promise(resolve => setTimeout(resolve, 1000));
            this.profileProvider.setNewWalletGroupOrder(wallets[0].credentials.keyId);
            this.endProcess(wallets[0].credentials.keyId);
        }))
            .catch(e => {
            this.showError(e);
        });
    }
    createWallets(coins) {
        if (this.isZeroState && !this.isOnboardingFlow) {
            this.showInfoSheet(coins);
            return;
        }
        this._createWallets(coins);
    }
    showError(err) {
        this.onGoingProcessProvider.clear();
        this.logger.error('Create: could not create wallet', err);
        const title = this.translate.instant('Error');
        err = this.bwcErrorProvider.msg(err);
        this.errorsProvider.showDefaultError(err, title);
    }
    endProcess(keyId) {
        this.onGoingProcessProvider.clear();
        if (this.isOnboardingFlow) {
            this.navCtrl.push(RecoveryKeyPage, {
                keyId,
                isOnboardingFlow: this.isOnboardingFlow
            });
        }
        else
            this.navCtrl.popToRoot().then(() => {
                this.events.publish('Local/FetchWallets');
            });
    }
    createAndBindTokenWallet(pairedWallet, token) {
        if (!_.isEmpty(pairedWallet)) {
            this.profileProvider.createTokenWallet(pairedWallet, token).then(() => {
                // store preferences for the paired eth wallet
                this.walletProvider.updateRemotePreferences(pairedWallet);
                this.endProcess();
            });
        }
    }
    showPairedWalletSelector(token) {
        const eligibleWallets = this.keyId
            ? this.profileProvider.getWalletsFromGroup({
                keyId: this.keyId,
                network: 'livenet',
                pairFor: token
            })
            : [];
        const walletSelector = this.actionSheetProvider.createInfoSheet('linkEthWallet', {
            wallets: eligibleWallets,
            token
        });
        walletSelector.present();
        walletSelector.onDidDismiss(pairedWallet => {
            return this.createAndBindTokenWallet(pairedWallet, token);
        });
    }
    setTokens(coin) {
        if (coin === 'eth' || !coin) {
            for (const token of this.availableTokens) {
                if (this.isZeroState) {
                    this.tokensSelected[token.symbol] = false;
                }
                else {
                    let canCreateit = _.isEmpty(this.profileProvider.getWalletsFromGroup({
                        keyId: this.keyId,
                        network: 'livenet',
                        pairFor: token
                    }));
                    this.tokenDisabled[token.symbol] = canCreateit;
                }
            }
        }
    }
    showInfoSheet(coins) {
        const infoSheet = this.actionSheetProvider.createInfoSheet('new-key');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                this.showKeyOnboardingSlides(coins);
                return;
            }
            this._createWallets(coins);
        });
    }
};
SelectCurrencyPage = __decorate([
    Component({
        selector: 'page-select-currency',
        templateUrl: 'select-currency.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        CurrencyProvider,
        NavController,
        Logger,
        NavParams,
        ProfileProvider,
        OnGoingProcessProvider,
        WalletProvider,
        PushNotificationsProvider,
        BwcErrorProvider,
        TranslateService,
        ModalController,
        PersistenceProvider,
        ErrorsProvider,
        Events])
], SelectCurrencyPage);
export { SelectCurrencyPage };
//# sourceMappingURL=select-currency.js.map