import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { AnalyticsProvider } from '../../../providers/analytics/analytics';
import { ConfigProvider } from '../../../providers/config/config';
import { Logger } from '../../../providers/logger/logger';
import { PlatformProvider } from '../../../providers/platform/platform';
import { ProfileProvider } from '../../../providers/profile/profile';
// Pages
import { ImportWalletPage } from '../../../pages/add/import-wallet/import-wallet';
import { CoinbasePage } from '../../../pages/integrations/coinbase/coinbase';
import { RecoveryKeyPage } from '../../../pages/onboarding/recovery-key/recovery-key';
import { AmountPage } from '../../../pages/send/amount/amount';
let AddFundsPage = class AddFundsPage {
    constructor(navCtrl, navParams, logger, profileProvider, analyticsProvider, configProvider, actionSheetProvider, platformProvider, viewCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.logger = logger;
        this.profileProvider = profileProvider;
        this.analyticsProvider = analyticsProvider;
        this.configProvider = configProvider;
        this.actionSheetProvider = actionSheetProvider;
        this.platformProvider = platformProvider;
        this.viewCtrl = viewCtrl;
        this.keyId = this.navParams.data.keyId;
        this.showCoinbase = !this.platformProvider.isMacApp();
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: AddFundsPage');
    }
    ionViewWillEnter() {
        this.needsBackup = this.keyId ? this.checkIfNeedsBackup() : false;
    }
    checkIfNeedsBackup() {
        const walletsGroup = this.profileProvider.getWalletGroup(this.keyId);
        return walletsGroup.needsBackup;
    }
    goToCoinbase() {
        this.navCtrl.push(CoinbasePage, { isOnboardingFlow: true });
    }
    goToAmountPage() {
        if (this.needsBackup) {
            this.showInfoSheet();
            return;
        }
        this.analyticsProvider.logEvent('buy_crypto_button_clicked', {});
        this.navCtrl.push(AmountPage, {
            fromBuyCrypto: true,
            nextPage: 'CryptoOrderSummaryPage',
            currency: this.configProvider.get().wallet.settings.alternativeIsoCode
        });
    }
    close() {
        this.viewCtrl.dismiss();
    }
    goToImportWallet() {
        this.navCtrl.push(ImportWalletPage);
    }
    showInfoSheet() {
        const infoSheet = this.actionSheetProvider.createInfoSheet('key-verification-required');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                this.navCtrl.push(RecoveryKeyPage, {
                    keyId: this.keyId
                });
            }
        });
    }
};
AddFundsPage = __decorate([
    Component({
        selector: 'page-add-funds',
        templateUrl: 'add-funds.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Logger,
        ProfileProvider,
        AnalyticsProvider,
        ConfigProvider,
        ActionSheetProvider,
        PlatformProvider,
        ViewController])
], AddFundsPage);
export { AddFundsPage };
//# sourceMappingURL=add-funds.js.map