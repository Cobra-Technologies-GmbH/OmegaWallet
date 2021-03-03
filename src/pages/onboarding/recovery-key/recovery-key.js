import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { Logger } from '../../../providers/logger/logger';
// Pages
import { BackupKeyPage } from '../../../pages/backup/backup-key/backup-key';
import { DisclaimerPage } from '../../../pages/onboarding/disclaimer/disclaimer';
let RecoveryKeyPage = class RecoveryKeyPage {
    constructor(navCtrl, navParams, logger, actionSheetProvider, platform) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.logger = logger;
        this.actionSheetProvider = actionSheetProvider;
        this.platform = platform;
        this.isOnboardingFlow = this.navParams.data.isOnboardingFlow;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: RecoveryKeyPage');
    }
    ionViewWillEnter() {
        this.initializeBackButtonHandler();
    }
    ionViewWillLeave() {
        this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    }
    goToBackupKey() {
        this.navCtrl.push(BackupKeyPage, {
            keyId: this.navParams.data.keyId,
            isOnboardingFlow: this.isOnboardingFlow
        });
    }
    showInfoSheet() {
        const infoSheet = this.actionSheetProvider.createInfoSheet('backup-later-warning');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                this.isOnboardingFlow
                    ? this.navCtrl.push(DisclaimerPage, {
                        keyId: this.navParams.data.keyId
                    })
                    : this.navCtrl.pop();
            }
        });
    }
    initializeBackButtonHandler() {
        this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
            this.showInfoSheet();
        });
    }
};
RecoveryKeyPage = __decorate([
    Component({
        selector: 'page-recovery-key',
        templateUrl: 'recovery-key.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Logger,
        ActionSheetProvider,
        Platform])
], RecoveryKeyPage);
export { RecoveryKeyPage };
//# sourceMappingURL=recovery-key.js.map