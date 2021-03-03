import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, Renderer2, ViewChild } from '@angular/core';
import { Device } from '@ionic-native/device';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { UserAgent } from '@ionic-native/user-agent';
import { Config, Events, ModalController, NavController, Platform } from 'ionic-angular';
import { ImageLoaderConfig } from 'ionic-image-loader';
import { Observable } from 'rxjs';
// Providers
import { BitPayIdProvider, BitPayProvider, GiftCardProvider, IABCardProvider, InAppBrowserProvider, PersistenceProvider } from '../providers';
import { AppProvider } from '../providers/app/app';
import { BitPayCardProvider } from '../providers/bitpay-card/bitpay-card';
import { BuyCryptoProvider } from '../providers/buy-crypto/buy-crypto';
import { CoinbaseProvider } from '../providers/coinbase/coinbase';
import { ConfigProvider } from '../providers/config/config';
import { DynamicLinksProvider } from '../providers/dynamic-links/dynamic-links';
import { EmailNotificationsProvider } from '../providers/email-notifications/email-notifications';
import { ExchangeCryptoProvider } from '../providers/exchange-crypto/exchange-crypto';
import { IncomingDataProvider } from '../providers/incoming-data/incoming-data';
import { KeyProvider } from '../providers/key/key';
import { Logger } from '../providers/logger/logger';
import { LogsProvider } from '../providers/logs/logs';
import { Network } from '../providers/persistence/persistence';
import { PlatformProvider } from '../providers/platform/platform';
import { PopupProvider } from '../providers/popup/popup';
import { ProfileProvider } from '../providers/profile/profile';
import { PushNotificationsProvider } from '../providers/push-notifications/push-notifications';
import { ThemeProvider } from '../providers/theme/theme';
import { TouchIdProvider } from '../providers/touchid/touchid';
import { WalletConnectProvider } from '../providers/wallet-connect/wallet-connect';
// Components
import { AdvertisingComponent } from '../components/advertising/advertising';
// Pages
import { CARD_IAB_CONFIG } from '../constants';
import { AddWalletPage } from '../pages/add-wallet/add-wallet';
import { CopayersPage } from '../pages/add/copayers/copayers';
import { ImportWalletPage } from '../pages/add/import-wallet/import-wallet';
import { JoinWalletPage } from '../pages/add/join-wallet/join-wallet';
import { FingerprintModalPage } from '../pages/fingerprint/fingerprint';
import { BitPayCardIntroPage } from '../pages/integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { PhaseOneCardIntro } from '../pages/integrations/bitpay-card/bitpay-card-phases/phase-one/phase-one-intro-page/phase-one-intro-page';
import { CoinbasePage } from '../pages/integrations/coinbase/coinbase';
import { SelectInvoicePage } from '../pages/integrations/invoice/select-invoice/select-invoice';
import { SimplexPage } from '../pages/integrations/simplex/simplex';
import { WalletConnectPage } from '../pages/integrations/wallet-connect/wallet-connect';
import { WyrePage } from '../pages/integrations/wyre/wyre';
import { DisclaimerPage } from '../pages/onboarding/disclaimer/disclaimer';
import { FeatureEducationPage } from '../pages/onboarding/feature-education/feature-education';
import { PaperWalletPage } from '../pages/paper-wallet/paper-wallet';
import { PinModalPage } from '../pages/pin/pin-modal/pin-modal';
import { AmountPage } from '../pages/send/amount/amount';
import { ConfirmPage } from '../pages/send/confirm/confirm';
import { AboutPage } from '../pages/settings/about/about';
import { AddressbookAddPage } from '../pages/settings/addressbook/add/add';
import { TabsPage } from '../pages/tabs/tabs';
import { WalletDetailsPage } from '../pages/wallet-details/wallet-details';
// As the handleOpenURL handler kicks in before the App is started,
// declare the handler function at the top of app.component.ts (outside the class definition)
// to track the passed Url
window.handleOpenURL = (url) => {
    window.handleOpenURL_LastURL = url;
};
let CopayApp = class CopayApp {
    constructor(config, platform, platformProvider, statusBar, splashScreen, events, logger, appProvider, profileProvider, configProvider, giftCardProvider, imageLoaderConfig, modalCtrl, coinbaseProvider, walletConnectProvider, bitPayCardProvider, buyCryptoProvider, emailNotificationsProvider, exchangeCryptoProvider, screenOrientation, popupProvider, pushNotificationsProvider, incomingDataProvider, renderer, userAgent, device, keyProvider, persistenceProvider, iab, iabCardProvider, bitpayProvider, bitpayIdProvider, themeProvider, logsProvider, dynamicLinksProvider) {
        this.config = config;
        this.platform = platform;
        this.platformProvider = platformProvider;
        this.statusBar = statusBar;
        this.splashScreen = splashScreen;
        this.events = events;
        this.logger = logger;
        this.appProvider = appProvider;
        this.profileProvider = profileProvider;
        this.configProvider = configProvider;
        this.giftCardProvider = giftCardProvider;
        this.imageLoaderConfig = imageLoaderConfig;
        this.modalCtrl = modalCtrl;
        this.coinbaseProvider = coinbaseProvider;
        this.walletConnectProvider = walletConnectProvider;
        this.bitPayCardProvider = bitPayCardProvider;
        this.buyCryptoProvider = buyCryptoProvider;
        this.emailNotificationsProvider = emailNotificationsProvider;
        this.exchangeCryptoProvider = exchangeCryptoProvider;
        this.screenOrientation = screenOrientation;
        this.popupProvider = popupProvider;
        this.pushNotificationsProvider = pushNotificationsProvider;
        this.incomingDataProvider = incomingDataProvider;
        this.renderer = renderer;
        this.userAgent = userAgent;
        this.device = device;
        this.keyProvider = keyProvider;
        this.persistenceProvider = persistenceProvider;
        this.iab = iab;
        this.iabCardProvider = iabCardProvider;
        this.bitpayProvider = bitpayProvider;
        this.bitpayIdProvider = bitpayIdProvider;
        this.themeProvider = themeProvider;
        this.logsProvider = logsProvider;
        this.dynamicLinksProvider = dynamicLinksProvider;
        this.NETWORK = 'livenet';
        this.pageMap = {
            AboutPage,
            AddressbookAddPage,
            AmountPage,
            BitPayCardIntroPage,
            PhaseOneCardIntro,
            CoinbasePage,
            ConfirmPage,
            CopayersPage,
            ImportWalletPage,
            JoinWalletPage,
            AddWalletPage,
            PaperWalletPage,
            SimplexPage,
            SelectInvoicePage,
            WalletConnectPage,
            WalletDetailsPage,
            WyrePage
        };
        this.imageLoaderConfig.setFileNameCachedWithExtension(true);
        this.imageLoaderConfig.useImageTag(true);
        this.imageLoaderConfig.enableSpinner(false);
        this.initializeApp();
    }
    ngOnDestroy() {
        this.onResumeSubscription.unsubscribe();
        if (this.iab) {
            Object.keys(this.iab.refs).forEach(ref => {
                this.iab.refs[ref].close();
            });
        }
    }
    initializeApp() {
        this.config.set('backButtonIcon', 'tab-button-back');
        this.platform
            .ready()
            .then(readySource => {
            this.onPlatformReady(readySource);
        })
            .catch(e => {
            this.logger.error('Platform is not ready.', e);
        });
    }
    onPlatformReady(readySource) {
        this.appProvider
            .load()
            .then(() => {
            this.onAppLoad(readySource);
        })
            .catch(err => {
            const title = 'Could not initialize the app';
            let message;
            try {
                message = err instanceof Error ? err.toString() : JSON.stringify(err);
            }
            catch (error) {
                message = 'Unknown error';
            }
            this.popupProvider.ionicAlert(title, message).then(() => {
                // Share logs
                const platform = this.platformProvider.isCordova
                    ? this.platformProvider.isAndroid
                        ? 'android'
                        : 'ios'
                    : 'desktop';
                this.logsProvider.get(this.appProvider.info.nameCase, platform);
            });
        });
    }
    onAppLoad(readySource) {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceInfo = this.platformProvider.getDeviceInfo();
            this.logger.info('Platform ready (' +
                readySource +
                '): ' +
                this.appProvider.info.nameCase +
                ' - v' +
                this.appProvider.info.version +
                ' #' +
                this.appProvider.info.commitHash +
                deviceInfo);
            this.platform.pause.subscribe(() => {
                const config = this.configProvider.get();
                const lockMethod = config && config.lock && config.lock.method
                    ? config.lock.method.toLowerCase()
                    : null;
                if (!lockMethod || lockMethod === 'disabled') {
                    return;
                }
            });
            this.logger.debug('BitPay: setting network');
            [
                this.bitpayProvider,
                this.bitpayIdProvider,
                this.iabCardProvider,
                this.giftCardProvider
            ].forEach(provider => provider.setNetwork(this.NETWORK));
            this.logger.debug('Setting Cached Total Balance');
            this.appProvider.setTotalBalance();
            if (this.platform.is('cordova')) {
                this.statusBar.show();
                // Set User-Agent
                this.logger.debug('Setting User Agent');
                this.userAgent.set(this.appProvider.info.name +
                    ' ' +
                    this.appProvider.info.version +
                    ' (' +
                    this.device.platform +
                    ' ' +
                    this.device.version +
                    ' - ' +
                    this.device.model +
                    ')');
                // Set to portrait
                this.logger.debug('Setting Screen Orientation');
                this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
                // Only for iOS
                if (this.platform.is('ios')) {
                    this.statusBar.overlaysWebView(true);
                }
                // Subscribe Resume
                this.logger.debug('On Resume Subscription');
                this.onResumeSubscription = this.platform.resume.subscribe(() => __awaiter(this, void 0, void 0, function* () {
                    // Check PIN or Fingerprint on Resume
                    this.openLockModal();
                    // Set Theme (light or dark mode)
                    yield this.themeProvider.load();
                    this.themeProvider.apply();
                    // Clear all notifications
                    this.pushNotificationsProvider.clearAllNotifications();
                    // Firebase Dynamic link
                    this.dynamicLinksProvider.init();
                }));
                // Check PIN or Fingerprint
                this.logger.debug('Open Lock Modal');
                this.openLockModal();
                // Clear all notifications
                this.pushNotificationsProvider.clearAllNotifications();
                // Firebase Dynamic link
                this.dynamicLinksProvider.init();
            }
            // Set Theme (light or dark mode)
            this.themeProvider.apply();
            if (this.platformProvider.isElectron)
                this.updateDesktopOnFocus();
            this.registerIntegrations();
            this.incomingDataRedirEvent();
            this.showAdvertisingEvent();
            this.events.subscribe('OpenWallet', (wallet, params) => this.openWallet(wallet, params));
            setTimeout(() => {
                this.logger.debug('Hide Splash Screen');
                this.splashScreen.hide();
            }, 1000);
            this.keyProvider
                .load()
                .then(() => {
                // Check Profile
                this.profileProvider
                    .loadAndBindProfile()
                    .then(onboardingState => {
                    switch (onboardingState) {
                        case 'NONAGREEDDISCLAIMER':
                            this.logger.warn('Non agreed disclaimer');
                            this.rootPage = DisclaimerPage;
                            break;
                        case 'UNFINISHEDONBOARDING':
                            this.logger.warn('Unfinished onboarding');
                            this.rootPage =
                                this.appProvider.info.nameCase === 'Copay'
                                    ? DisclaimerPage
                                    : FeatureEducationPage;
                            break;
                        default:
                            const profile = this.profileProvider.profile;
                            this.onProfileLoad(profile);
                    }
                })
                    .catch(err => {
                    this.popupProvider
                        .ionicAlert('Could not load the profile', err.message)
                        .then(() => {
                        // Share logs
                        const platform = this.platformProvider.isCordova
                            ? this.platformProvider.isAndroid
                                ? 'android'
                                : 'ios'
                            : 'desktop';
                        this.logsProvider.get(this.appProvider.info.nameCase, platform);
                    });
                });
            })
                .catch(err => {
                this.popupProvider.ionicAlert('Error loading keys', err.message || '');
                this.logger.error('Error loading keys: ', err);
            });
            let [token, cards] = yield Promise.all([
                this.persistenceProvider.getBitPayIdPairingToken(Network[this.NETWORK]),
                this.persistenceProvider.getBitpayDebitCards(Network[this.NETWORK])
            ]);
            yield this.persistenceProvider.setTempMdesCertOnlyFlag('disabled');
            if (this.platformProvider.isCordova &&
                this.appProvider.info.name === 'bitpay') {
                const host = this.NETWORK === 'testnet' ? 'test.bitpay.com' : 'bitpay.com';
                this.logger.log(`IAB host -> ${host}`);
                // preloading the view
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    // if (cards && this.platform.is('ios')) {
                    //   try {
                    //     cards = await this.iabCardProvider.checkAppleWallet(cards);
                    //   } catch (err) {
                    //     this.logger.error('apple wallet checkPairedDevices error', err);
                    //   }
                    // }
                    const agent = yield this.userAgent.get();
                    this.logger.debug('BitPay: create IAB Instance');
                    try {
                        this.cardIAB_Ref = yield this.iab.createIABInstance('card', `${CARD_IAB_CONFIG},OverrideUserAgent=${agent}`, `https://${host}/wallet-card?context=bpa`, `( async () => {
              const sendMessageToWallet = (message) => webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify(message));
              try {
                window.postMessage({message: 'isDarkModeEnabled', payload: {theme: ${this.themeProvider.isDarkModeEnabled()}}},'*');
                window.postMessage({message: 'getAppVersion', payload: ${JSON.stringify(this.appProvider.info.version)}},'*');
                await new Promise((res) => setTimeout(res, 300));
                sessionStorage.setItem('isPaired', ${!!token}); 
                sessionStorage.setItem('cards', ${JSON.stringify(JSON.stringify(cards))});
                sendMessageToWallet({message: 'IABLoaded'});
              } catch(err) {
                sendMessageToWallet({message: 'IABError', log: err});
              }   
              })()`);
                        this.iabCardProvider.init();
                    }
                    catch (err) {
                        this.logger.debug('Error creating IAB instance: ', err.message);
                    }
                }));
            }
        });
    }
    updateDesktopOnFocus() {
        const { remote } = window.require('electron');
        const win = remote.getCurrentWindow();
        win.on('focus', () => {
            if (this.themeProvider.useSystemTheme) {
                this.themeProvider.getDetectedSystemTheme().then(theme => {
                    if (this.themeProvider.currentAppTheme == theme)
                        return;
                    this.themeProvider.setActiveTheme('system', theme);
                });
            }
        });
    }
    onProfileLoad(profile) {
        this.emailNotificationsProvider.init(); // Update email subscription if necessary
        this.initPushNotifications();
        if (this.platform.is('cordova')) {
            this.handleDeepLinks();
        }
        if (this.platformProvider.isElectron) {
            this.handleDeepLinksElectron();
        }
        if (profile) {
            this.logger.info('Profile exists.');
            this.rootPage = TabsPage;
        }
        else {
            this.logger.info('No profile exists.');
            this.profileProvider.createProfile();
            this.rootPage =
                this.appProvider.info.nameCase === 'Copay'
                    ? DisclaimerPage
                    : FeatureEducationPage;
        }
    }
    openLockModal() {
        if (this.appProvider.isLockModalOpen)
            return;
        const config = this.configProvider.get();
        const lockMethod = config && config.lock && config.lock.method
            ? config.lock.method.toLowerCase()
            : null;
        if (!lockMethod) {
            return;
        }
        if (lockMethod == 'pin') {
            this.openPINModal('checkPin');
        }
        else if (lockMethod == 'fingerprint') {
            this.openFingerprintModal();
        }
        this.iabCardProvider.pause();
    }
    openPINModal(action) {
        this.appProvider.isLockModalOpen = true;
        const modal = this.modalCtrl.create(PinModalPage, { action }, {
            enableBackdropDismiss: false,
            cssClass: 'fullscreen-modal'
        });
        modal.present({ animate: false });
        modal.onWillDismiss(() => {
            this.onLockWillDismiss();
        });
        modal.onDidDismiss(() => {
            this.onLockDidDismiss();
        });
    }
    openFingerprintModal() {
        this.appProvider.isLockModalOpen = true;
        const modal = this.modalCtrl.create(FingerprintModalPage, {}, {
            enableBackdropDismiss: false,
            cssClass: 'fullscreen-modal'
        });
        modal.present({ animate: false });
        modal.onWillDismiss(() => {
            this.onLockWillDismiss();
        });
        modal.onDidDismiss(() => {
            this.onLockDidDismiss();
        });
    }
    onLockDidDismiss() {
        this.appProvider.isLockModalOpen = false;
        this.events.publish('Local/FetchWallets');
        this.events.publish('Local/showNewFeaturesSlides');
    }
    onLockWillDismiss() {
        this.iabCardProvider.resume();
    }
    registerIntegrations() {
        // Gift Cards
        if (this.appProvider.info._enabledExtensions.giftcards)
            this.giftCardProvider.register();
        // Buy Crypto
        if (this.appProvider.info._enabledExtensions.buycrypto &&
            !this.platformProvider.isMacApp()) {
            this.buyCryptoProvider.register();
        }
        // Exchange Crypto
        if (this.appProvider.info._enabledExtensions.exchangecrypto &&
            !this.platformProvider.isMacApp()) {
            this.exchangeCryptoProvider.register();
        }
        // Coinbase
        if (this.appProvider.info._enabledExtensions.coinbase) {
            this.coinbaseProvider.setCredentials();
            this.coinbaseProvider.register();
        }
        // Wallet Connect
        if (this.appProvider.info._enabledExtensions.walletConnect &&
            !this.platformProvider.isMacApp()) {
            this.walletConnectProvider.register();
            this.persistenceProvider.getWalletConnect().then(walletConnectData => {
                this.walletConnectProvider.retrieveWalletConnector(walletConnectData);
            });
        }
        // Omega Card
        if (this.appProvider.info._enabledExtensions.debitcard)
            this.bitPayCardProvider.register();
    }
    incomingDataRedirEvent() {
        this.events.subscribe('IncomingDataRedir', nextView => {
            if (!nextView.name) {
                setTimeout(() => {
                    this.getGlobalTabs()
                        .goToRoot()
                        .then(_ => {
                        this.getGlobalTabs().select(2);
                    });
                }, 300);
            }
            else if (nextView.name === 'CardsPage') {
                this.getGlobalTabs()
                    .goToRoot()
                    .then(_ => {
                    this.getGlobalTabs().select(3);
                });
            }
            else if (nextView.name === 'WalletConnectPage') {
                const currentIndex = this.nav.getActive().index;
                const currentView = this.nav.getViews();
                const views = this.nav.getActiveChildNavs()[0].getSelected()._views;
                if ((views[views.length - 1].name !== 'WalletConnectPage' &&
                    currentView[currentIndex].name !== 'WalletConnectPage') ||
                    nextView.params.uri.indexOf('bridge') !== -1) {
                    this.getGlobalTabs()
                        .goToRoot()
                        .then(_ => {
                        this.getGlobalTabs().select(4);
                        this.nav.push(this.pageMap[nextView.name], nextView.params);
                    });
                }
                return;
            }
            else {
                if (nextView.params && nextView.params.deepLink) {
                    // From deepLink
                    setTimeout(() => {
                        this.getGlobalTabs()
                            .goToRoot()
                            .then(_ => {
                            this.getGlobalTabs().select(0);
                            this.nav.push(this.pageMap[nextView.name]);
                        });
                    }, 1000);
                    return;
                }
                this.closeScannerFromWithinWallet();
                // wait for wallets status
                setTimeout(() => {
                    const globalNav = this.getGlobalTabs().getSelected();
                    globalNav
                        .push(this.pageMap[nextView.name], nextView.params)
                        .then(() => {
                        if (typeof nextView.callback === 'function') {
                            nextView.callback();
                        }
                    });
                }, 300);
            }
        });
    }
    showAdvertisingEvent() {
        this.events.subscribe('ShowAdvertising', data => {
            this.getGlobalTabs().select(0);
            const modal = this.modalCtrl.create(AdvertisingComponent, {
                advertising: data
            });
            modal.present();
        });
    }
    openWallet(wallet, params) {
        if (wallet.isComplete()) {
            this.getGlobalTabs().select(1);
            this.nav.push(WalletDetailsPage, Object.assign(Object.assign({}, params), { walletId: wallet.credentials.walletId }));
        }
        else {
            // check if modal is already open
            if (this.isCopayerModalOpen) {
                this.copayerModal.dismiss();
            }
            this.isCopayerModalOpen = true;
            this.copayerModal = this.modalCtrl.create(CopayersPage, Object.assign(Object.assign({}, params), { walletId: wallet.credentials.walletId }), {
                cssClass: 'wallet-details-modal'
            });
            this.copayerModal.present();
            this.copayerModal.onDidDismiss(() => {
                this.isCopayerModalOpen = false;
            });
        }
    }
    closeScannerFromWithinWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.getWalletDetailsModal()) {
                return;
            }
            yield this.toggleScannerVisibilityFromWithinWallet(false, 300);
        });
    }
    toggleScannerVisibilityFromWithinWallet(visible, transitionDuration) {
        const walletDetailsModal = this.getWalletDetailsModal();
        visible
            ? this.renderer.addClass(walletDetailsModal, 'scanning')
            : this.renderer.removeClass(walletDetailsModal, 'scanning');
        return Observable.timer(transitionDuration).toPromise();
    }
    getWalletDetailsModal() {
        return document.getElementsByClassName('wallet-details-modal')[0];
    }
    initPushNotifications() {
        this.pushNotificationsProvider.init();
    }
    handleDeepLinks() {
        // Check if app was resume by custom url scheme
        window.handleOpenURL = (url) => {
            this.logger.info('App was resumed by custom url scheme');
            this.handleOpenUrl(url);
        };
        // Check if app was opened by custom url scheme
        const lastUrl = window.handleOpenURL_LastURL || '';
        if (lastUrl && lastUrl !== '') {
            delete window.handleOpenURL_LastURL;
            // Important delay to have all views loaded before process URL
            setTimeout(() => {
                this.logger.info('App was opened by custom url scheme');
                this.handleOpenUrl(lastUrl);
            }, 2000);
        }
    }
    handleOpenUrl(url) {
        if (url.includes('wallet-card/order-now')) {
            const context = url.includes('new') ? 'new' : 'fv';
            this.persistenceProvider.setCardFastTrackEnabled(context);
        }
        if (!this.incomingDataProvider.redir(url)) {
            this.logger.warn('Unknown URL! : ' + url);
        }
    }
    handleDeepLinksElectron() {
        const electron = window.require('electron');
        electron.ipcRenderer.on('open-url-event', (_, url) => {
            this.processUrl(url);
        });
    }
    processUrl(pathData) {
        if (pathData.indexOf('bitcoincash:/') != -1) {
            this.logger.debug('Bitcoin Cash URL found');
            this.handleOpenUrl(pathData.substring(pathData.indexOf('bitcoincash:/')));
        }
        else if (pathData.indexOf('bitcoin:/') != -1) {
            this.logger.debug('Bitcoin URL found');
            this.handleOpenUrl(pathData.substring(pathData.indexOf('bitcoin:/')));
        }
        else if (pathData.indexOf(this.appProvider.info.name + '://') != -1) {
            this.logger.debug(this.appProvider.info.name + ' URL found');
            this.handleOpenUrl(pathData.substring(pathData.indexOf(this.appProvider.info.name + '://')));
        }
        else {
            this.logger.debug('URL found');
            this.handleOpenUrl(pathData);
        }
    }
    getGlobalTabs() {
        return this.nav.getActiveChildNavs()[0].viewCtrl.instance.tabs;
    }
};
__decorate([
    ViewChild('appNav'),
    __metadata("design:type", NavController)
], CopayApp.prototype, "nav", void 0);
CopayApp = __decorate([
    Component({
        templateUrl: 'app.html',
        providers: [TouchIdProvider]
    }),
    __metadata("design:paramtypes", [Config,
        Platform,
        PlatformProvider,
        StatusBar,
        SplashScreen,
        Events,
        Logger,
        AppProvider,
        ProfileProvider,
        ConfigProvider,
        GiftCardProvider,
        ImageLoaderConfig,
        ModalController,
        CoinbaseProvider,
        WalletConnectProvider,
        BitPayCardProvider,
        BuyCryptoProvider,
        EmailNotificationsProvider,
        ExchangeCryptoProvider,
        ScreenOrientation,
        PopupProvider,
        PushNotificationsProvider,
        IncomingDataProvider,
        Renderer2,
        UserAgent,
        Device,
        KeyProvider,
        PersistenceProvider,
        InAppBrowserProvider,
        IABCardProvider,
        BitPayProvider,
        BitPayIdProvider,
        ThemeProvider,
        LogsProvider,
        DynamicLinksProvider])
], CopayApp);
export { CopayApp };
//# sourceMappingURL=app.component.js.map