import { __awaiter, __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Component, NgZone, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, Platform } from 'ionic-angular';
import { AppProvider } from '../../providers/app/app';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ConfigProvider } from '../../providers/config/config';
import { Logger } from '../../providers/logger/logger';
import { Network, PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../../providers/platform/platform';
import { ProfileProvider } from '../../providers/profile/profile';
import { RateProvider } from '../../providers/rate/rate';
import { TabProvider } from '../../providers/tab/tab';
import { WalletProvider } from '../../providers/wallet/wallet';
import { CardsPage } from '../cards/cards';
import { HomePage } from '../home/home';
import { ScanPage } from '../scan/scan';
import { SettingsPage } from '../settings/settings';
import { WalletsPage } from '../wallets/wallets';
import * as _ from 'lodash';
let TabsPage = class TabsPage {
    constructor(plt, appProvider, profileProvider, logger, walletProvider, events, persistenceProvider, translate, bwcErrorProvider, tabProvider, rateProvider, platformProvider, configProvider, http) {
        this.plt = plt;
        this.appProvider = appProvider;
        this.profileProvider = profileProvider;
        this.logger = logger;
        this.walletProvider = walletProvider;
        this.events = events;
        this.persistenceProvider = persistenceProvider;
        this.translate = translate;
        this.bwcErrorProvider = bwcErrorProvider;
        this.tabProvider = tabProvider;
        this.rateProvider = rateProvider;
        this.platformProvider = platformProvider;
        this.configProvider = configProvider;
        this.http = http;
        this.NETWORK = 'livenet';
        this.bwsEventHandler = (walletId, type) => {
            _.each([
                'TxProposalRejectedBy',
                'TxProposalAcceptedBy',
                'transactionProposalRemoved',
                'TxProposalRemoved',
                'NewOutgoingTx',
                'UpdateTx',
                'NewIncomingTx'
            ], (eventName) => {
                if (walletId &&
                    type == eventName &&
                    (type === 'NewIncomingTx' || type === 'NewOutgoingTx')) {
                    this.fetchAllWalletsStatus();
                }
            });
        };
        this.connectionError = _.debounce(() => __awaiter(this, void 0, void 0, function* () {
            this.events.publish('Local/ConnectionError');
        }), 5000, {
            leading: false
        });
        this.fetchAllWalletsStatus = _.debounce(() => __awaiter(this, void 0, void 0, function* () {
            this._fetchAllWallets();
        }), 5000, {
            leading: true
        });
        this.homeRoot = HomePage;
        this.walletsRoot = WalletsPage;
        this.scanRoot = ScanPage;
        this.cardsRoot = CardsPage;
        this.settingsRoot = SettingsPage;
        this.zone = new NgZone({ enableLongStackTrace: false });
        this.logger.info('Loaded: TabsPage');
        this.appName = this.appProvider.info.nameCase;
        this.isCordova = this.platformProvider.isCordova;
        this.scanIconType =
            this.appName == 'BitPay' ? 'tab-scan' : 'tab-copay-scan';
        if (this.platformProvider.isElectron) {
            this.updateDesktopOnFocus();
        }
        this.persistenceProvider.getCardExperimentFlag().then(status => {
            if (status === 'enabled') {
                this.persistenceProvider
                    .getCardNotificationBadge()
                    .then(badgeStatus => {
                    this.cardNotificationBadgeText =
                        badgeStatus === 'disabled' ? null : 'New';
                });
            }
        });
    }
    subscribeEvents() {
        this.events.subscribe('experimentUpdateStart', () => {
            this.tabs.select(2);
        });
        this.events.subscribe('bwsEvent', this.bwsEventHandler);
        this.events.subscribe('Local/UpdateTxps', data => {
            this.setTxps(data);
        });
        this.events.subscribe('Local/FetchWallets', () => {
            this.fetchAllWalletsStatus();
        });
    }
    unsubscribeEvents() {
        this.events.unsubscribe('bwsEvent');
        this.events.unsubscribe('Local/UpdateTxps');
        this.events.unsubscribe('Local/FetchWallets');
        this.events.unsubscribe('experimentUpdateStart');
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscribeEvents();
            this.onResumeSubscription = this.plt.resume.subscribe(() => {
                this.subscribeEvents();
                setTimeout(() => {
                    this.updateTxps();
                    this.fetchAllWalletsStatus();
                }, 1000);
            });
            this.onPauseSubscription = this.plt.pause.subscribe(() => {
                this.events.unsubscribe('bwsEvent');
                this.events.unsubscribe('Local/UpdateTxps');
                this.events.unsubscribe('Local/FetchWallets');
                this.events.unsubscribe('experimentUpdateStart');
            });
            yield this.checkCardEnabled();
            yield this.tabProvider.prefetchCards();
        });
    }
    ngOnDestroy() {
        this.onResumeSubscription.unsubscribe();
        this.onPauseSubscription.unsubscribe();
        this.unsubscribeEvents();
    }
    checkCardEnabled() {
        return __awaiter(this, void 0, void 0, function* () {
            let cardExperimentEnabled = (yield this.persistenceProvider.getCardExperimentFlag()) === 'enabled';
            const cards = yield this.persistenceProvider.getBitpayDebitCards(Network[this.NETWORK]);
            if (!cardExperimentEnabled) {
                try {
                    this.logger.debug('BitPay: setting country');
                    const { country } = yield this.http
                        .get('https://bitpay.com/wallet-card/location')
                        .toPromise();
                    if (country === 'US') {
                        this.logger.debug('If US: Set Card Experiment Flag Enabled');
                        yield this.persistenceProvider.setCardExperimentFlag('enabled');
                        cardExperimentEnabled = true;
                    }
                }
                catch (err) {
                    this.logger.error('Error setting country: ', err);
                }
            }
            // set banner advertisement in home.ts
            this.events.publish('CardAdvertisementUpdate', {
                cardExperimentEnabled,
                cards
            });
        });
    }
    disableCardNotificationBadge() {
        this.persistenceProvider.getCardExperimentFlag().then(status => {
            if (status === 'enabled') {
                this.cardNotificationBadgeText = null;
                this.persistenceProvider.setCardNotificationBadge('disabled');
            }
        });
    }
    updateTxps() {
        this.profileProvider.getTxps({ limit: 3 }).then(data => {
            this.setTxps(data);
        });
    }
    setTxps(data) {
        this.zone.run(() => {
            this.txpsN = data.n;
        });
    }
    updateDesktopOnFocus() {
        const { remote } = window.require('electron');
        const win = remote.getCurrentWindow();
        win.on('focus', () => {
            this.events.publish('Desktop/onFocus');
            setTimeout(() => {
                this.updateTxps();
                this.fetchAllWalletsStatus();
            }, 1000);
        });
    }
    updateTotalBalance(wallets) {
        this.rateProvider.getLastDayRates().then(lastDayRatesArray => {
            this.walletProvider
                .getTotalAmount(wallets, lastDayRatesArray)
                .then(data => {
                this.logger.debug('Total Balance and Price Updated');
                this.events.publish('Local/HomeBalance', data);
                this.events.publish('Local/PriceUpdate');
            });
        });
    }
    processWalletError(wallet, err) {
        wallet.error = wallet.errorObj = null;
        if (!err || err == 'INPROGRESS')
            return;
        wallet.cachedStatus = null;
        wallet.errorObj = err;
        if (err.message === '403') {
            this.events.publish('Local/AccessDenied');
            wallet.error = this.translate.instant('Access denied');
        }
        else if (err === 'WALLET_NOT_REGISTERED') {
            wallet.error = this.translate.instant('Wallet not registered');
        }
        else {
            wallet.error = this.bwcErrorProvider.msg(err);
        }
        this.logger.warn(this.bwcErrorProvider.msg(wallet.error, 'Error updating status for ' + wallet.id));
    }
    checkAltCurrency() {
        const alternativeIsoCode = this.configProvider.get().wallet.settings
            .alternativeIsoCode;
        if (!this.rateProvider.isAltCurrencyAvailable(alternativeIsoCode)) {
            const altCurrency = {
                name: this.configProvider.get().wallet.settings.alternativeName,
                isoCode: alternativeIsoCode
            };
            const params = {
                altCurrency,
                tabIndex: this.tabs._tabs.length - 1 // The index of SettingsPage tab depends on the platform and distribution
            };
            this.events.publish('Local/UnsupportedAltCurrency', params);
        }
    }
    _fetchAllWallets() {
        let hasConnectionError = false;
        this.profileProvider.setLastKnownBalance();
        let wallets = this.profileProvider.wallet;
        if (_.isEmpty(wallets)) {
            this.events.publish('Local/HomeBalance');
            return;
        }
        this.logger.debug('Fetching All Wallets and Updating Total Balance');
        wallets = _.filter(this.profileProvider.wallet, w => {
            return !w.hidden;
        });
        let foundMessage = false;
        const pr = wallet => {
            return this.walletProvider
                .fetchStatus(wallet, {})
                .then(st => {
                wallet.cachedStatus = st;
                wallet.error = wallet.errorObj = null;
                const balance = wallet.coin === 'xrp'
                    ? wallet.cachedStatus.availableBalanceStr
                    : wallet.cachedStatus.totalBalanceStr;
                this.persistenceProvider.setLastKnownBalance(wallet.id, balance);
                this.events.publish('Local/WalletUpdate', {
                    walletId: wallet.id,
                    finished: true
                });
                if (!foundMessage && !_.isEmpty(st.serverMessages)) {
                    foundMessage = true;
                    this.events.publish('Local/ServerMessage', {
                        serverMessages: st.serverMessages
                    });
                }
                return Promise.resolve();
            })
                .catch(err => {
                this.processWalletError(wallet, err);
                if (err && err.message == 'Wallet service connection error.') {
                    hasConnectionError = true;
                    this.connectionError();
                }
                return Promise.resolve();
            });
        };
        const promises = [];
        _.each(wallets, wallet => {
            promises.push(pr(wallet));
        });
        Promise.all(promises).then(() => {
            if (!hasConnectionError) {
                this.checkAltCurrency(); // Check if the alternative currency setted is no longer supported
                this.updateTotalBalance(wallets);
            }
            this.updateTxps();
        });
    }
};
__decorate([
    ViewChild('tabs'),
    __metadata("design:type", Object)
], TabsPage.prototype, "tabs", void 0);
TabsPage = __decorate([
    Component({
        templateUrl: 'tabs.html'
    }),
    __metadata("design:paramtypes", [Platform,
        AppProvider,
        ProfileProvider,
        Logger,
        WalletProvider,
        Events,
        PersistenceProvider,
        TranslateService,
        BwcErrorProvider,
        TabProvider,
        RateProvider,
        PlatformProvider,
        ConfigProvider,
        HttpClient])
], TabsPage);
export { TabsPage };
//# sourceMappingURL=tabs.js.map