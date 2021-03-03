import { __awaiter, __decorate, __metadata } from "tslib";
import { ChangeDetectorRef, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController, NavController } from 'ionic-angular';
import * as _ from 'lodash';
// providers
import { BitPayIdProvider, IABCardProvider, ReplaceParametersProvider } from '../../providers';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AppProvider } from '../../providers/app/app';
import { BitPayCardProvider } from '../../providers/bitpay-card/bitpay-card';
import { ConfigProvider } from '../../providers/config/config';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { HomeIntegrationsProvider } from '../../providers/home-integrations/home-integrations';
import { LanguageProvider } from '../../providers/language/language';
import { Logger } from '../../providers/logger/logger';
import { NewFeatureData } from '../../providers/new-feature-data/new-feature-data';
import { Network, PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../../providers/platform/platform';
import { ProfileProvider } from '../../providers/profile/profile';
import { ThemeProvider } from '../../providers/theme/theme';
import { TouchIdProvider } from '../../providers/touchid/touchid';
// pages
import { animate, style, transition, trigger } from '@angular/animations';
import { AddPage } from '../add/add';
import { CryptoSettingsPage } from '../buy-crypto/crypto-settings/crypto-settings';
import { ExchangeCryptoSettingsPage } from '../exchange-crypto/exchange-crypto-settings/exchange-crypto-settings';
import { BitPaySettingsPage } from '../integrations/bitpay-card/bitpay-settings/bitpay-settings';
import { CoinbaseSettingsPage } from '../integrations/coinbase/coinbase-settings/coinbase-settings';
import { GiftCardsSettingsPage } from '../integrations/gift-cards/gift-cards-settings/gift-cards-settings';
import { WalletConnectPage } from '../integrations/wallet-connect/wallet-connect';
import { NewFeaturePage } from '../new-feature/new-feature';
import { PinModalPage } from '../pin/pin-modal/pin-modal';
import { AboutPage } from './about/about';
import { AddressbookPage } from './addressbook/addressbook';
import { AdvancedPage } from './advanced/advanced';
import { AltCurrencyPage } from './alt-currency/alt-currency';
import { BitPayIdPage } from './bitpay-id/bitpay-id';
import { FeePolicyPage } from './fee-policy/fee-policy';
import { KeySettingsPage } from './key-settings/key-settings';
import { LanguagePage } from './language/language';
import { LocalThemePage } from './local-theme/local-theme';
import { LockPage } from './lock/lock';
import { NotificationsPage } from './notifications/notifications';
import { SharePage } from './share/share';
import { WalletSettingsPage } from './wallet-settings/wallet-settings';
let SettingsPage = class SettingsPage {
    constructor(navCtrl, app, language, externalLinkProvider, profileProvider, configProvider, logger, homeIntegrationsProvider, bitPayCardProvider, platformProvider, translate, modalCtrl, touchid, analyticsProvider, persistenceProvider, bitPayIdProvider, changeRef, iabCardProvider, themeProvider, events, newFeatureData, replaceParametersProvider) {
        this.navCtrl = navCtrl;
        this.app = app;
        this.language = language;
        this.externalLinkProvider = externalLinkProvider;
        this.profileProvider = profileProvider;
        this.configProvider = configProvider;
        this.logger = logger;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.bitPayCardProvider = bitPayCardProvider;
        this.platformProvider = platformProvider;
        this.translate = translate;
        this.modalCtrl = modalCtrl;
        this.touchid = touchid;
        this.analyticsProvider = analyticsProvider;
        this.persistenceProvider = persistenceProvider;
        this.bitPayIdProvider = bitPayIdProvider;
        this.changeRef = changeRef;
        this.iabCardProvider = iabCardProvider;
        this.themeProvider = themeProvider;
        this.events = events;
        this.newFeatureData = newFeatureData;
        this.replaceParametersProvider = replaceParametersProvider;
        this.integrationServices = [];
        this.cardServices = [];
        this.bitpayCardItems = [];
        this.showBitPayCard = false;
        this.network = Network[this.bitPayIdProvider.getEnvironment().network];
        this.showReorder = false;
        this.tapped = 0;
        this.certOnlyTapped = 0;
        this.appName = this.app.info.nameCase;
        this.appVersion = this.app.info.version;
        this.isCordova = this.platformProvider.isCordova;
        this.isCopay = this.app.info.name === 'copay';
        this.user$ = this.iabCardProvider.user$;
        this.events.subscribe('updateCards', cards => {
            if (cards && cards.length > 0) {
                this.bitpayCardItems = cards;
            }
        });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: SettingsPage');
        this.aboutApp = this.replaceParametersProvider.replace(this.translate.instant('About {{appName}}'), { appName: this.appName });
    }
    ionViewWillEnter() {
        this.persistenceProvider
            .getBitpayIdPairingFlag()
            .then(res => (this.bitpayIdPairingEnabled = res === 'enabled'));
        if (this.iabCardProvider.ref) {
            // check for user info
            this.persistenceProvider
                .getBitPayIdUserInfo(this.network)
                .then((user) => {
                this.bitPayIdUserInfo = user;
            });
            this.user$.subscribe((user) => __awaiter(this, void 0, void 0, function* () {
                if (user) {
                    this.bitPayIdUserInfo = user;
                    this.changeRef.detectChanges();
                }
            }));
        }
        this.currentLanguageName = this.language.getName(this.language.getCurrent());
        const opts = {
            showHidden: true
        };
        const wallets = this.profileProvider.getWallets(opts);
        this.walletsGroups = _.values(_.groupBy(_.filter(wallets, wallet => {
            return wallet.keyId != 'read-only';
        }), 'keyId'));
        this.readOnlyWalletsGroup = this.profileProvider.getWalletsFromGroup({
            keyId: 'read-only'
        });
        this.config = this.configProvider.get();
        this.selectedAlternative = {
            name: this.config.wallet.settings.alternativeName,
            isoCode: this.config.wallet.settings.alternativeIsoCode
        };
        this.lockMethod =
            this.config && this.config.lock && this.config.lock.method
                ? this.config.lock.method.toLowerCase()
                : null;
        this.useLegacyQrCode = this.config.legacyQrCode.show;
        this.showTotalBalance = this.config.totalBalance.show;
        this.featureList = this.newFeatureData.get();
    }
    ionViewDidEnter() {
        // Show integrations
        const integrations = this.homeIntegrationsProvider.get();
        // Get Theme
        this.appTheme = this.themeProvider.getCurrentAppTheme();
        // Hide BitPay if linked
        setTimeout(() => {
            this.integrationServices = _.remove(_.clone(integrations), x => {
                if (x.type == 'card' || (this.platformProvider.isMacApp() && !x.linked))
                    return false;
                else
                    return x;
            });
            this.cardServices = _.remove(_.clone(integrations), x => {
                if (x.name === 'debitcard' ||
                    x.type === 'exchange' ||
                    (x.name === 'giftcards' && this.platformProvider.isMacApp()))
                    return false;
                else
                    return x;
            });
        }, 200);
        // Only BitPay Wallet
        this.bitPayCardProvider.get({ noHistory: true }).then(cards => {
            this.showBitPayCard = !!this.app.info._enabledExtensions.debitcard;
            this.bitpayCardItems = cards;
        });
    }
    trackBy(index) {
        return index;
    }
    openBitPayIdPage() {
        if (this.bitPayIdUserInfo) {
            this.navCtrl.push(BitPayIdPage, this.bitPayIdUserInfo);
        }
        else {
            this.iabCardProvider.loadingWrapper(() => {
                this.logger.log('settings - pairing');
                this.iabCardProvider.show();
                setTimeout(() => {
                    this.iabCardProvider.sendMessage({
                        message: 'pairingOnly'
                    }, () => { });
                }, 100);
            });
        }
    }
    mdesFlag() {
        // adding this for testing purposes
        this.tapped++;
        if (this.tapped >= 10) {
            this.persistenceProvider.getTempMdesFlag().then(flag => {
                if (flag === 'bypassed') {
                    this.persistenceProvider.setTempMdesFlag('disabled');
                    alert('MDES bypass -> disabled');
                }
                else {
                    this.persistenceProvider.setTempMdesFlag('bypassed');
                    alert('MDES bypass -> bypassed');
                }
                this.tapped = 0;
            });
        }
    }
    mdesCertOnlyFlag() {
        // adding this for testing purposes
        this.certOnlyTapped++;
        if (this.certOnlyTapped >= 10) {
            this.persistenceProvider.getTempMdesCertOnlyFlag().then(flag => {
                if (flag === 'bypassed') {
                    this.persistenceProvider.setTempMdesCertOnlyFlag('disabled');
                    alert('MDES cert only bypass -> disabled');
                }
                else {
                    this.persistenceProvider.setTempMdesCertOnlyFlag('bypassed');
                    alert('MDES cert only bypass -> bypassed');
                }
                this.certOnlyTapped = 0;
            });
        }
    }
    openAltCurrencyPage() {
        this.navCtrl.push(AltCurrencyPage);
    }
    openLanguagePage() {
        this.navCtrl.push(LanguagePage);
    }
    openWhatsNew() {
        if (this.featureList) {
            const modal = this.modalCtrl.create(NewFeaturePage, {
                featureList: this.featureList
            });
            modal.present();
        }
    }
    openAdvancedPage() {
        this.navCtrl.push(AdvancedPage);
    }
    openAboutPage() {
        this.navCtrl.push(AboutPage);
    }
    openThemePage() {
        this.navCtrl.push(LocalThemePage);
    }
    openLockPage() {
        const config = this.configProvider.get();
        const lockMethod = config && config.lock && config.lock.method
            ? config.lock.method.toLowerCase()
            : null;
        if (!lockMethod || lockMethod == 'disabled')
            this.navCtrl.push(LockPage);
        if (lockMethod == 'pin')
            this.openPinModal('lockSetUp');
        if (lockMethod == 'fingerprint')
            this.checkFingerprint();
    }
    openAddressBookPage() {
        this.navCtrl.push(AddressbookPage);
    }
    openNotificationsPage() {
        this.navCtrl.push(NotificationsPage);
    }
    openFeePolicyPage() {
        this.navCtrl.push(FeePolicyPage);
    }
    openWalletSettingsPage(walletId) {
        this.navCtrl.push(WalletSettingsPage, { walletId });
    }
    openSharePage() {
        this.navCtrl.push(SharePage);
    }
    openSettingIntegration(name) {
        switch (name) {
            case 'coinbase':
                this.navCtrl.push(CoinbaseSettingsPage);
                break;
            case 'debitcard':
                this.navCtrl.push(BitPaySettingsPage);
                break;
            case 'buycrypto':
                this.navCtrl.push(CryptoSettingsPage);
                break;
            case 'exchangecrypto':
                this.navCtrl.push(ExchangeCryptoSettingsPage);
                break;
            case 'giftcards':
                this.navCtrl.push(GiftCardsSettingsPage);
                break;
            case 'walletConnect':
                this.navCtrl.push(WalletConnectPage);
                break;
        }
    }
    openCardSettings(id) {
        this.iabCardProvider.loadingWrapper(() => {
            const message = `openSettings?${id}`;
            this.iabCardProvider.show();
            setTimeout(() => {
                this.iabCardProvider.sendMessage({
                    message
                }, () => { });
            });
        });
    }
    openGiftCardsSettings() {
        this.navCtrl.push(GiftCardsSettingsPage);
    }
    openHelpExternalLink() {
        this.analyticsProvider.logEvent('help', {});
        const url = this.appName == 'Copay'
            ? 'https://github.com/bitpay/copay/issues'
            : 'https://help.bitpay.com/bitpay-app';
        const optIn = true;
        const title = null;
        const message = this.translate.instant('Help and support information is available at the website.');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    openPinModal(action) {
        const modal = this.modalCtrl.create(PinModalPage, { action }, { cssClass: 'fullscreen-modal' });
        modal.present();
        modal.onDidDismiss(cancelClicked => {
            if (!cancelClicked)
                this.navCtrl.push(LockPage);
        });
    }
    checkFingerprint() {
        this.touchid.check().then(() => {
            this.navCtrl.push(LockPage);
        });
    }
    openSupportEncryptPassword() {
        const url = 'https://support.bitpay.com/hc/en-us/articles/360000244506-What-Does-a-Spending-Password-Do-';
        const optIn = true;
        const title = null;
        const message = this.translate.instant('Read more in our support page');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    openWalletGroupSettings(keyId) {
        if (this.showReorder)
            return;
        this.navCtrl.push(KeySettingsPage, { keyId });
    }
    goToAddView() {
        this.navCtrl.push(AddPage, {
            isZeroState: true
        });
    }
    toggleShowBalanceFlag() {
        let opts = {
            totalBalance: { show: this.showTotalBalance }
        };
        this.configProvider.set(opts);
        if (this.showTotalBalance)
            this.events.publish('Local/FetchWallets');
    }
    reorder() {
        this.showReorder = !this.showReorder;
    }
    reorderAccounts(indexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = this.walletsGroups[indexes.from];
            this.walletsGroups.splice(indexes.from, 1);
            this.walletsGroups.splice(indexes.to, 0, element);
            _.each(this.walletsGroups, (walletGroup, index) => {
                this.profileProvider.setWalletGroupOrder(walletGroup[0].keyId, index);
            });
            yield new Promise(resolve => setTimeout(resolve, 1000));
            this.profileProvider.setOrderedWalletsByGroup();
        });
    }
    toggleQrCodeLegacyFlag() {
        let opts = {
            legacyQrCode: { show: this.useLegacyQrCode }
        };
        this.configProvider.set(opts);
    }
    openPrivacyPolicy() {
        const url = 'https://bitpay.com/about/privacy';
        const optIn = true;
        const title = null;
        const message = this.translate.instant('View Privacy Policy');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    openTermsOfUse() {
        const url = 'https://bitpay.com/legal/terms-of-use/#wallet-terms-of-use';
        const optIn = true;
        const title = null;
        const message = this.translate.instant('View Wallet Terms of Use');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
};
SettingsPage = __decorate([
    Component({
        selector: 'page-settings',
        templateUrl: 'settings.html',
        animations: [
            trigger('fade', [
                transition(':enter', [
                    style({
                        transform: 'translateY(5px)',
                        opacity: 0
                    }),
                    animate('200ms')
                ])
            ])
        ]
    }),
    __metadata("design:paramtypes", [NavController,
        AppProvider,
        LanguageProvider,
        ExternalLinkProvider,
        ProfileProvider,
        ConfigProvider,
        Logger,
        HomeIntegrationsProvider,
        BitPayCardProvider,
        PlatformProvider,
        TranslateService,
        ModalController,
        TouchIdProvider,
        AnalyticsProvider,
        PersistenceProvider,
        BitPayIdProvider,
        ChangeDetectorRef,
        IABCardProvider,
        ThemeProvider,
        Events,
        NewFeatureData,
        ReplaceParametersProvider])
], SettingsPage);
export { SettingsPage };
//# sourceMappingURL=settings.js.map