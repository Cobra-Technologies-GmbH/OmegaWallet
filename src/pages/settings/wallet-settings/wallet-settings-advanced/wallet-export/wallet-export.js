import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Logger } from '../../../../../providers/logger/logger';
// native
import { Clipboard } from '@ionic-native/clipboard';
import { SocialSharing } from '@ionic-native/social-sharing';
// providers
import { AppProvider } from '../../../../../providers/app/app';
import { BackupProvider } from '../../../../../providers/backup/backup';
import { BwcErrorProvider } from '../../../../../providers/bwc-error/bwc-error';
import { ConfigProvider } from '../../../../../providers/config/config';
import { ErrorsProvider } from '../../../../../providers/errors/errors';
import { PersistenceProvider } from '../../../../../providers/persistence/persistence';
import { PlatformProvider } from '../../../../../providers/platform/platform';
import { ProfileProvider } from '../../../../../providers/profile/profile';
import { WalletProvider } from '../../../../../providers/wallet/wallet';
let WalletExportPage = class WalletExportPage {
    constructor(profileProvider, navCtrl, walletProvider, navParams, formBuilder, logger, persistenceProvider, backupProvider, platformProvider, socialSharing, appProvider, clipboard, toastCtrl, translate, configProvider, bwcErrorProvider, errorsProvider) {
        this.profileProvider = profileProvider;
        this.navCtrl = navCtrl;
        this.walletProvider = walletProvider;
        this.navParams = navParams;
        this.formBuilder = formBuilder;
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.backupProvider = backupProvider;
        this.platformProvider = platformProvider;
        this.socialSharing = socialSharing;
        this.appProvider = appProvider;
        this.clipboard = clipboard;
        this.toastCtrl = toastCtrl;
        this.translate = translate;
        this.configProvider = configProvider;
        this.bwcErrorProvider = bwcErrorProvider;
        this.errorsProvider = errorsProvider;
        this.password = '';
        this.showAdv = false;
        this.showAdvanced = false;
        this.exportWalletForm = this.formBuilder.group({
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required],
            noSignEnabled: [false]
        }, { validator: this.matchingPasswords('password', 'confirmPassword') });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: WalletExportPage');
    }
    ionViewWillEnter() {
        this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
        this.isEncrypted = this.wallet.isPrivKeyEncrypted;
        this.canSign = this.wallet.canSign;
        this.isCordova = this.platformProvider.isCordova;
        this.isSafari = this.platformProvider.isSafari;
        this.isIOS = this.platformProvider.isIOS;
    }
    matchingPasswords(passwordKey, confirmPasswordKey) {
        return (group) => {
            const password = group.controls[passwordKey];
            const confirmPassword = group.controls[confirmPasswordKey];
            if (password.value !== confirmPassword.value) {
                return {
                    mismatchedPasswords: true
                };
            }
            return undefined;
        };
    }
    getPassword() {
        return new Promise((resolve, reject) => {
            if (this.password)
                return resolve(this.password);
            this.walletProvider
                .prepare(this.wallet)
                .then(password => {
                this.password = password;
                return resolve(password);
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    downloadWalletBackup() {
        this.getPassword()
            .then((password) => {
            this.getAddressBook()
                .then(localAddressBook => {
                const opts = {
                    noSign: this.exportWalletForm.value.noSignEnabled,
                    addressBook: localAddressBook,
                    password
                };
                this.backupProvider
                    .walletDownload(this.navParams.data.walletId, opts, this.exportWalletForm.value.password)
                    .then(() => {
                    this.navCtrl.pop();
                })
                    .catch(() => {
                    this.showErrorInfoSheet();
                });
            })
                .catch(() => {
                this.showErrorInfoSheet();
            });
        })
            .catch(err => {
            if (err &&
                err.message != 'FINGERPRINT_CANCELLED' &&
                err.message != 'PASSWORD_CANCELLED') {
                if (err.message == 'WRONG_PASSWORD') {
                    this.errorsProvider.showWrongEncryptPasswordError();
                }
                else {
                    this.showErrorInfoSheet(this.bwcErrorProvider.msg(err));
                }
            }
        });
    }
    getAddressBook() {
        return new Promise((resolve, reject) => {
            this.persistenceProvider
                .getAddressBook(this.wallet.credentials.network)
                .then(localAddressBook => {
                if (!localAddressBook)
                    return resolve();
                try {
                    localAddressBook = JSON.parse(localAddressBook);
                }
                catch (ex) {
                    this.logger.warn('Wallet Export: JSON Parse localAddressBook is not necessary', ex);
                }
                return resolve(localAddressBook);
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    getBackup() {
        return new Promise(resolve => {
            this.getPassword()
                .then((password) => {
                this.getAddressBook()
                    .then(localAddressBook => {
                    const opts = {
                        noSign: this.exportWalletForm.value.noSignEnabled,
                        addressBook: localAddressBook,
                        password
                    };
                    const ew = this.backupProvider.walletExport(this.navParams.data.walletId, opts, this.exportWalletForm.value.password);
                    if (!ew) {
                        this.showErrorInfoSheet();
                    }
                    return resolve(ew);
                })
                    .catch(() => {
                    this.showErrorInfoSheet();
                    return resolve();
                });
            })
                .catch(err => {
                if (err &&
                    err.message != 'FINGERPRINT_CANCELLED' &&
                    err.message != 'PASSWORD_CANCELLED') {
                    if (err.message == 'WRONG_PASSWORD') {
                        this.errorsProvider.showWrongEncryptPasswordError();
                    }
                    else {
                        this.showErrorInfoSheet(this.bwcErrorProvider.msg(err));
                    }
                }
                return resolve();
            });
        });
    }
    viewWalletBackup() {
        this.getBackup().then(backup => {
            const ew = backup;
            if (!ew)
                return;
            this.backupWalletPlainText = ew;
        });
    }
    copyWalletBackup() {
        this.getBackup().then(backup => {
            const ew = backup;
            if (!ew)
                return;
            this.clipboard.copy(ew);
            const copyMessage = this.translate.instant('Copied to clipboard');
            const showSuccess = this.toastCtrl.create({
                message: copyMessage,
                duration: 1000
            });
            showSuccess.present();
        });
    }
    sendWalletBackup() {
        const preparingMessage = this.translate.instant('Preparing backup...');
        const showSuccess = this.toastCtrl.create({
            message: preparingMessage,
            duration: 1000
        });
        showSuccess.present();
        let name = this.wallet.credentials.walletName || this.wallet.credentials.walletId;
        const config = this.configProvider.get();
        const alias = config.aliasFor && config.aliasFor[this.wallet.credentials.walletId];
        if (alias) {
            name = alias + ' [' + name + ']';
        }
        this.getBackup().then(backup => {
            const ew = backup;
            if (!ew)
                return;
            if (this.exportWalletForm.value.noSignEnabled)
                name = name + '(No Private Key)';
            const subject = this.appProvider.info.nameCase + ' Wallet Backup: ' + name;
            const body = 'Here is the encrypted backup of the wallet ' +
                name +
                ': \n\n' +
                ew +
                '\n\n To import this backup, copy all text between {...}, including the symbols {}';
            // Check if sharing via email is supported
            this.socialSharing
                .canShareViaEmail()
                .then(() => {
                this.logger.info('sharing via email is possible');
                this.socialSharing
                    .shareViaEmail(body, subject, null, // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                null // FILES: can be null, a string, or an array
                )
                    .then(data => {
                    this.logger.info('Email created successfully: ', data);
                })
                    .catch(err => {
                    this.logger.error('socialSharing Error: ', err);
                });
            })
                .catch(() => {
                this.logger.warn('sharing via email is not possible');
                this.socialSharing.share(body, subject).catch(err => {
                    this.logger.error('socialSharing Error: ', err);
                });
            });
        });
    }
    showErrorInfoSheet(err) {
        const title = this.translate.instant('Error');
        const msg = err ? err : this.translate.instant('Failed to export');
        this.logger.error(err);
        this.errorsProvider.showDefaultError(msg, title);
    }
};
WalletExportPage = __decorate([
    Component({
        selector: 'page-wallet-export',
        templateUrl: 'wallet-export.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        NavController,
        WalletProvider,
        NavParams,
        FormBuilder,
        Logger,
        PersistenceProvider,
        BackupProvider,
        PlatformProvider,
        SocialSharing,
        AppProvider,
        Clipboard,
        ToastController,
        TranslateService,
        ConfigProvider,
        BwcErrorProvider,
        ErrorsProvider])
], WalletExportPage);
export { WalletExportPage };
//# sourceMappingURL=wallet-export.js.map