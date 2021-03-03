import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
// providers
import { AppProvider } from '../../../../providers/app/app';
import { BwcErrorProvider } from '../../../../providers/bwc-error/bwc-error';
import { ErrorsProvider } from '../../../../providers/errors/errors';
import { KeyProvider } from '../../../../providers/key/key';
import { Logger } from '../../../../providers/logger/logger';
import { ProfileProvider } from '../../../../providers/profile/profile';
let KeyQrExportPage = class KeyQrExportPage {
    constructor(profileProvider, logger, navParams, navCtrl, translate, bwcErrorProvider, keyProvider, appProvider, errorsProvider) {
        this.profileProvider = profileProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.navCtrl = navCtrl;
        this.translate = translate;
        this.bwcErrorProvider = bwcErrorProvider;
        this.keyProvider = keyProvider;
        this.appProvider = appProvider;
        this.errorsProvider = errorsProvider;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: KeyQrExportPage');
    }
    ionViewWillEnter() {
        this.keyId = this.navParams.data.keyId;
        this.walletsGroup = this.profileProvider.getWalletGroup(this.keyId);
        this.keysEncrypted = this.walletsGroup.isPrivKeyEncrypted;
        this.appName = this.appProvider.info.nameCase;
    }
    ionViewDidEnter() {
        this.keyProvider
            .handleEncryptedWallet(this.keyId)
            .then((password) => {
            const keys = this.keyProvider.get(this.keyId, password);
            this.keysEncrypted = false;
            this.generateQrCode(keys);
        })
            .catch(err => {
            if (err && err.message != 'PASSWORD_CANCELLED') {
                if (err.message == 'WRONG_PASSWORD') {
                    this.errorsProvider.showWrongEncryptPasswordError();
                }
                else {
                    let title = this.translate.instant('Could not decrypt wallet');
                    this.showErrorInfoSheet(this.bwcErrorProvider.msg(err), title);
                }
            }
            this.navCtrl.pop();
        });
    }
    generateQrCode(keys) {
        if (!keys || !keys.mnemonic) {
            const err = this.translate.instant('Exporting via QR not supported for this wallet');
            const title = this.translate.instant('Error');
            this.showErrorInfoSheet(err, title);
            return;
        }
        const mnemonicHasPassphrase = this.keyProvider.mnemonicHasPassphrase(this.keyId);
        this.code =
            '1|' + keys.mnemonic + '|null|null|' + mnemonicHasPassphrase + '|null';
        this.logger.debug('QR code generated. mnemonicHasPassphrase: ' + mnemonicHasPassphrase);
    }
    showErrorInfoSheet(err, infoSheetTitle) {
        if (!err)
            return;
        this.logger.error('Could not get keys:', err);
        this.errorsProvider.showDefaultError(err, infoSheetTitle);
    }
};
KeyQrExportPage = __decorate([
    Component({
        selector: 'page-key-qr-export',
        templateUrl: 'key-qr-export.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        Logger,
        NavParams,
        NavController,
        TranslateService,
        BwcErrorProvider,
        KeyProvider,
        AppProvider,
        ErrorsProvider])
], KeyQrExportPage);
export { KeyQrExportPage };
//# sourceMappingURL=key-qr-export.js.map