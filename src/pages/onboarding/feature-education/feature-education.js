import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { NavController, Slides } from 'ionic-angular';
// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { ConfigProvider } from '../../../providers/config/config';
import { Logger } from '../../../providers/logger/logger';
import { PlatformProvider } from '../../../providers/platform/platform';
// Pages
import { ImportWalletPage } from '../../../pages/add/import-wallet/import-wallet';
import { SelectCurrencyPage } from '../../../pages/add/select-currency/select-currency';
import { LockMethodPage } from '../../../pages/onboarding/lock-method/lock-method';
let FeatureEducationPage = class FeatureEducationPage {
    constructor(navCtrl, logger, actionSheetProvider, configProvider, platformProvider) {
        this.navCtrl = navCtrl;
        this.logger = logger;
        this.actionSheetProvider = actionSheetProvider;
        this.configProvider = configProvider;
        this.platformProvider = platformProvider;
        this.pageMap = {
            SelectCurrencyPage,
            ImportWalletPage
        };
        this.params = {
            isOnboardingFlow: true,
            isZeroState: true
        };
        this.isCordova = this.platformProvider.isCordova;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: FeatureEducationPage');
    }
    ionViewWillLoad() {
        this.featureEducationSlides.lockSwipeToPrev(true);
    }
    slideChanged() {
        // Disable first bounce
        let currentIndex = this.featureEducationSlides.getActiveIndex();
        currentIndex == 0
            ? this.featureEducationSlides.lockSwipeToPrev(true)
            : this.featureEducationSlides.lockSwipeToPrev(false);
    }
    goToNextPage(nextViewName) {
        const config = this.configProvider.get();
        if ((config.lock && config.lock.method) || !this.isCordova)
            this.navCtrl.push(this.pageMap[nextViewName], this.params);
        else
            this.showInfoSheet(nextViewName);
    }
    showInfoSheet(nextViewName) {
        const infoSheet = this.actionSheetProvider.createInfoSheet('protect-money');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option)
                this.goToLockMethodPage(nextViewName);
        });
    }
    goToLockMethodPage(name) {
        let nextView = {
            name,
            params: this.params
        };
        this.navCtrl.push(LockMethodPage, { nextView });
    }
};
__decorate([
    ViewChild('featureEducationSlides'),
    __metadata("design:type", Slides)
], FeatureEducationPage.prototype, "featureEducationSlides", void 0);
FeatureEducationPage = __decorate([
    Component({
        selector: 'page-feature-education',
        templateUrl: 'feature-education.html'
    }),
    __metadata("design:paramtypes", [NavController,
        Logger,
        ActionSheetProvider,
        ConfigProvider,
        PlatformProvider])
], FeatureEducationPage);
export { FeatureEducationPage };
//# sourceMappingURL=feature-education.js.map