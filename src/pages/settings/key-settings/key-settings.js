import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// providers
import { DerivationPathHelperProvider } from '../../../providers/derivation-path-helper/derivation-path-helper';
import { ErrorsProvider } from '../../../providers/errors/errors';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { KeyProvider } from '../../../providers/key/key';
import { Logger } from '../../../providers/logger/logger';
import { ProfileProvider } from '../../../providers/profile/profile';
import { WalletProvider } from '../../../providers/wallet/wallet';
// pages
import { AddPage } from '../../add/add';
import { BackupKeyPage } from '../../backup/backup-key/backup-key';
import { KeyNamePage } from '../key-settings/key-name/key-name';
import { KeyOnboardingPage } from '../key-settings/key-onboarding/key-onboarding';
import { WalletSettingsPage } from '../wallet-settings/wallet-settings';
import { WalletExportPage } from '../wallet-settings/wallet-settings-advanced/wallet-export/wallet-export';
import { ClearEncryptPasswordPage } from './clear-encrypt-password/clear-encrypt-password';
import { ExtendedPrivateKeyPage } from './extended-private-key/extended-private-key';
import { KeyDeletePage } from './key-delete/key-delete';
import { KeyQrExportPage } from './key-qr-export/key-qr-export';
let KeySettingsPage = class KeySettingsPage {
    constructor(profileProvider, logger, walletProvider, navCtrl, navParams, externalLinkProvider, translate, keyProvider, derivationPathHelperProvider, modalCtrl, errorsProvider) {
        this.profileProvider = profileProvider;
        this.logger = logger;
        this.walletProvider = walletProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.externalLinkProvider = externalLinkProvider;
        this.translate = translate;
        this.keyProvider = keyProvider;
        this.derivationPathHelperProvider = derivationPathHelperProvider;
        this.modalCtrl = modalCtrl;
        this.errorsProvider = errorsProvider;
        this.deleted = false;
        this.logger.info('Loaded:  KeySettingsPage');
        this.keyId = this.navParams.data.keyId;
        this.showReorder = false;
    }
    ionViewWillEnter() {
        this.walletsGroup = this.profileProvider.getWalletGroup(this.keyId);
        this.wallets = this.profileProvider.getWalletsFromGroup({
            keyId: this.keyId,
            showHidden: true
        });
        this.derivationStrategy = this.derivationPathHelperProvider.getDerivationStrategy(this.wallets[0].credentials.rootPath);
        this.canSign = this.walletsGroup.canSign;
        this.isDeletedSeed = this.walletsGroup.isDeletedSeed;
        this.needsBackup = this.walletsGroup.needsBackup;
        this.encryptEnabled = this.walletsGroup.isPrivKeyEncrypted;
    }
    touchIdChange() {
        if (this.touchIdPrevValue == this.touchIdEnabled)
            return;
        const newStatus = this.touchIdEnabled;
        this.walletProvider
            .setTouchId(this.wallets, newStatus)
            .then(() => {
            this.touchIdPrevValue = this.touchIdEnabled;
            this.logger.debug('Touch Id status changed: ' + newStatus);
        })
            .catch(err => {
            this.logger.error('Error with fingerprint:', err);
            this.touchIdEnabled = this.touchIdPrevValue;
        });
    }
    encryptChange() {
        const val = this.encryptEnabled;
        this.profileProvider.removeProfileLegacy();
        if (val && !this.walletsGroup.isPrivKeyEncrypted) {
            this.logger.debug('Encrypting private key for', this.walletsGroup.name);
            this.keyProvider
                .encrypt(this.keyId)
                .then(() => {
                const key = this.keyProvider.getKey(this.keyId);
                const replaceKey = true;
                this.keyProvider.addKey(key, replaceKey);
                this.profileProvider.walletsGroups[this.keyId].isPrivKeyEncrypted = true;
                this.logger.debug('Key encrypted');
            })
                .catch(err => {
                this.encryptEnabled = false;
                const title = this.translate.instant('Could not encrypt wallet');
                this.showErrorInfoSheet(err, title);
            });
        }
        else if (!val && this.walletsGroup.isPrivKeyEncrypted) {
            this.keyProvider
                .decrypt(this.keyId)
                .then(() => {
                const key = this.keyProvider.getKey(this.keyId);
                const replaceKey = true;
                this.keyProvider.addKey(key, replaceKey);
                this.profileProvider.walletsGroups[this.keyId].isPrivKeyEncrypted = false;
                this.logger.debug('Key decrypted');
            })
                .catch(err => {
                this.encryptEnabled = true;
                if (err === 'WRONG_PASSWORD') {
                    this.errorsProvider.showWrongEncryptPasswordError();
                }
                else {
                    const title = this.translate.instant('Could not decrypt wallet');
                    this.showErrorInfoSheet(err, title);
                }
            });
        }
    }
    showErrorInfoSheet(err, infoSheetTitle) {
        if (!err)
            return;
        this.logger.warn('Could not encrypt/decrypt group wallets:', err);
        this.errorsProvider.showDefaultError(err, infoSheetTitle);
    }
    openBackupSettings() {
        if (this.derivationStrategy == 'BIP45') {
            this.navCtrl.push(WalletExportPage, {
                walletId: this.wallets[0].credentials.walletId
            });
        }
        else {
            this.navCtrl.push(BackupKeyPage, {
                keyId: this.keyId
            });
        }
    }
    openClearEncryptPasswordPage() {
        this.navCtrl.push(ClearEncryptPasswordPage, {
            keyId: this.keyId
        });
    }
    openWalletGroupDelete() {
        this.navCtrl.push(KeyDeletePage, {
            keyId: this.keyId
        });
    }
    openQrExport() {
        this.navCtrl.push(KeyQrExportPage, {
            keyId: this.keyId
        });
    }
    openWalletGroupExtendedPrivateKey() {
        this.navCtrl.push(ExtendedPrivateKeyPage, {
            keyId: this.keyId
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
    openWalletSettings(id) {
        if (this.showReorder)
            return;
        this.navCtrl.push(WalletSettingsPage, { walletId: id });
    }
    reorder() {
        this.showReorder = !this.showReorder;
    }
    reorderAccounts(indexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = this.wallets[indexes.from];
            this.wallets.splice(indexes.from, 1);
            this.wallets.splice(indexes.to, 0, element);
            _.each(this.wallets, (wallet, index) => {
                this.profileProvider.setWalletOrder(wallet.id, index);
            });
            yield new Promise(resolve => setTimeout(resolve, 1000));
            this.profileProvider.setOrderedWalletsByGroup();
        });
    }
    goToAddPage() {
        this.navCtrl.push(AddPage, { keyId: this.keyId });
    }
    openWalletGroupName() {
        this.navCtrl.push(KeyNamePage, {
            keyId: this.keyId
        });
    }
    showKeyOnboardingSlides() {
        const modal = this.modalCtrl.create(KeyOnboardingPage, null, {
            showBackdrop: true,
            enableBackdropDismiss: true
        });
        modal.present();
    }
};
KeySettingsPage = __decorate([
    Component({
        selector: 'page-key-settings',
        templateUrl: 'key-settings.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        Logger,
        WalletProvider,
        NavController,
        NavParams,
        ExternalLinkProvider,
        TranslateService,
        KeyProvider,
        DerivationPathHelperProvider,
        ModalController,
        ErrorsProvider])
], KeySettingsPage);
export { KeySettingsPage };
//# sourceMappingURL=key-settings.js.map