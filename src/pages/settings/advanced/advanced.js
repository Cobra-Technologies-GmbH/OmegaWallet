import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';
// providers
import { AppProvider, ConfigProvider, Logger, PlatformProvider, PopupProvider, ProfileProvider } from '../../../providers';
import { WalletRecoverPage } from './wallet-recover-page/wallet-recover-page';
let AdvancedPage = class AdvancedPage {
    constructor(configProvider, profileProvider, navCtrl, logger, platformProvider, splashScreen, popupProvider, translate, appProvider) {
        this.configProvider = configProvider;
        this.profileProvider = profileProvider;
        this.navCtrl = navCtrl;
        this.logger = logger;
        this.platformProvider = platformProvider;
        this.splashScreen = splashScreen;
        this.popupProvider = popupProvider;
        this.translate = translate;
        this.appProvider = appProvider;
        this.isCopay = this.appProvider.info.name === 'copay';
        this.profileProvider
            .getProfileLegacy()
            .then(oldProfile => {
            this.oldProfileAvailable = oldProfile ? true : false;
            if (!this.oldProfileAvailable)
                return;
            this.wallets = _.filter(oldProfile.credentials, value => {
                return value && (value.mnemonic || value.mnemonicEncrypted);
            });
        })
            .catch(err => {
            this.oldProfileAvailable = false;
            this.logger.info('Error retrieving old profile, ', err);
        });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: AdvancedPage');
    }
    ionViewWillEnter() {
        let config = this.configProvider.get();
        this.spendUnconfirmed = config.wallet.spendUnconfirmed;
    }
    spendUnconfirmedChange() {
        let opts = {
            wallet: {
                spendUnconfirmed: this.spendUnconfirmed
            }
        };
        this.configProvider.set(opts);
    }
    openWalletRecoveryPage() {
        this.navCtrl.push(WalletRecoverPage);
    }
    resetAllSettings() {
        const title = this.translate.instant('Reset All Settings');
        const message = this.translate.instant('Do you want to reset all settings to default value?');
        this.popupProvider.ionicConfirm(title, message).then(ok => {
            if (!ok)
                return;
            this.configProvider.reset();
            window.location.reload();
            if (this.platformProvider.isCordova)
                this.splashScreen.show();
        });
    }
};
AdvancedPage = __decorate([
    Component({
        selector: 'page-advanced',
        templateUrl: 'advanced.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        ProfileProvider,
        NavController,
        Logger,
        PlatformProvider,
        SplashScreen,
        PopupProvider,
        TranslateService,
        AppProvider])
], AdvancedPage);
export { AdvancedPage };
//# sourceMappingURL=advanced.js.map