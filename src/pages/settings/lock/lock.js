import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from 'ionic-angular';
// pages
import { PinModalPage } from '../../pin/pin-modal/pin-modal';
// providers
import { ConfigProvider } from '../../../providers/config/config';
import { ProfileProvider } from '../../../providers/profile/profile';
import { TouchIdProvider } from '../../../providers/touchid/touchid';
import * as _ from 'lodash';
let LockPage = class LockPage {
    constructor(configProvider, modalCtrl, touchIdProvider, profileProvider, translate) {
        this.configProvider = configProvider;
        this.modalCtrl = modalCtrl;
        this.touchIdProvider = touchIdProvider;
        this.profileProvider = profileProvider;
        this.translate = translate;
        this.options = [];
        this.checkLockOptions();
    }
    checkLockOptions() {
        this.lockOptions = this.configProvider.get().lock;
        this.touchIdProvider.isAvailable().then((isAvailable) => {
            let needsBackup = this.needsBackup();
            this.options = [
                {
                    label: this.translate.instant('Disabled'),
                    method: 'disabled',
                    enabled: !this.lockOptions.method ||
                        (this.lockOptions.method &&
                            this.lockOptions.method.toLowerCase() == 'disabled'
                            ? true
                            : false),
                    disabled: false
                },
                {
                    label: this.translate.instant('PIN'),
                    method: 'pin',
                    enabled: this.lockOptions.method &&
                        this.lockOptions.method.toLowerCase() == 'pin'
                        ? true
                        : false,
                    disabled: needsBackup
                },
                {
                    label: this.translate.instant('Biometric'),
                    method: 'fingerprint',
                    enabled: this.lockOptions.method &&
                        this.lockOptions.method.toLowerCase() == 'fingerprint'
                        ? true
                        : false,
                    disabled: !isAvailable || needsBackup
                }
            ];
        });
    }
    select(method) {
        switch (method) {
            case 'disabled':
                this.removeLockMethod();
                break;
            case 'pin':
                this.openPinModal('pinSetUp');
                break;
            case 'fingerprint':
                this.lockByFingerprint();
                break;
        }
    }
    removeLockMethod() {
        let lock = { method: 'disabled', value: null, bannedUntil: null };
        this.configProvider.set({ lock });
        this.checkLockOptions();
    }
    openPinModal(action) {
        const modal = this.modalCtrl.create(PinModalPage, { action }, { cssClass: 'fullscreen-modal' });
        modal.present();
        modal.onDidDismiss(() => {
            this.checkLockOptions();
        });
    }
    lockByFingerprint() {
        let lock = { method: 'fingerprint', value: null, bannedUntil: null };
        this.configProvider.set({ lock });
        this.checkLockOptions();
    }
    needsBackup() {
        let wallets = this.profileProvider.getWallets();
        let singleLivenetWallet = wallets.length == 1 &&
            wallets[0].network == 'livenet' &&
            wallets[0].needsBackup;
        let atLeastOneLivenetWallet = _.find(wallets, w => {
            return w.network == 'livenet' && w.needsBackup;
        });
        if (singleLivenetWallet) {
            this.needsBackupMsg = this.translate.instant('Back up your wallet before using this function');
            return true;
        }
        else if (atLeastOneLivenetWallet) {
            this.needsBackupMsg = this.translate.instant('Back up all your wallets before using this function');
            return true;
        }
        else {
            this.needsBackupMsg = null;
            return false;
        }
    }
};
LockPage = __decorate([
    Component({
        selector: 'page-lock',
        templateUrl: 'lock.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        ModalController,
        TouchIdProvider,
        ProfileProvider,
        TranslateService])
], LockPage);
export { LockPage };
//# sourceMappingURL=lock.js.map