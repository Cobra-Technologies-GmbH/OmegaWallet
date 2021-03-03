import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { ConfigProvider } from '../../../providers/config/config';
import { Logger } from '../../../providers/logger/logger';
import { TouchIdProvider } from '../../../providers/touchid/touchid';
// Pages
import { ImportWalletPage } from '../../../pages/add/import-wallet/import-wallet';
import { SelectCurrencyPage } from '../../../pages/add/select-currency/select-currency';
import { PinModalPage } from '../../../pages/pin/pin-modal/pin-modal';
let LockMethodPage = class LockMethodPage {
    constructor(navCtrl, navParams, logger, modalCtrl, touchIdProvider, actionSheetProvider, configProvider) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.logger = logger;
        this.modalCtrl = modalCtrl;
        this.touchIdProvider = touchIdProvider;
        this.actionSheetProvider = actionSheetProvider;
        this.configProvider = configProvider;
        this.pinMethodSelected = false;
        this.pageMap = {
            SelectCurrencyPage,
            ImportWalletPage
        };
        this.nextView = this.navParams.data.nextView;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: LockMethodPage');
    }
    ionViewWillEnter() {
        this.checkLockOptions();
    }
    checkLockOptions() {
        this.touchIdProvider.isAvailable().then((isAvailable) => {
            if (isAvailable) {
                this.biometricMethod =
                    this.touchIdProvider.getIosBiometricMethod() === 'face'
                        ? 'faceId'
                        : 'fingerprint';
            }
            else {
                this.pinMethodSelected = true;
                this.openPinModal();
            }
        });
    }
    verifyBiometricLockMethod() {
        if (this.biometricMethod === 'fingerprint' ||
            this.biometricMethod === 'faceId') {
            this.touchIdProvider.check().then(() => {
                let lock = { method: 'fingerprint', value: null, bannedUntil: null };
                this.configProvider.set({ lock });
                this.navCtrl.push(this.pageMap[this.nextView.name], this.nextView.params);
            });
        }
    }
    openPinModal() {
        const modal = this.modalCtrl.create(PinModalPage, {
            action: 'pinSetUp'
        }, { cssClass: 'fullscreen-modal' });
        modal.present();
        modal.onDidDismiss(cancelClicked => {
            if (cancelClicked) {
                this.pinMethodSelected = false;
                if (!this.biometricMethod)
                    this.navCtrl.pop();
            }
            else
                this.navCtrl.push(this.pageMap[this.nextView.name], this.nextView.params);
        });
    }
    showInfoSheet(infoSheetType) {
        const infoSheet = this.actionSheetProvider.createInfoSheet(infoSheetType);
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                this.pinMethodSelected = true;
                this.openPinModal();
            }
        });
    }
};
LockMethodPage = __decorate([
    Component({
        selector: 'page-lock-method',
        templateUrl: 'lock-method.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Logger,
        ModalController,
        TouchIdProvider,
        ActionSheetProvider,
        ConfigProvider])
], LockMethodPage);
export { LockMethodPage };
//# sourceMappingURL=lock-method.js.map