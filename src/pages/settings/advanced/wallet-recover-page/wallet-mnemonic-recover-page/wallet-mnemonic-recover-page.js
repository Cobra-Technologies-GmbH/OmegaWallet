import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NavParams } from 'ionic-angular';
import { BwcProvider } from '../../../../../providers/bwc/bwc';
import { ErrorsProvider } from '../../../../../providers/errors/errors';
import { Logger } from '../../../../../providers/logger/logger';
import { PopupProvider } from '../../../../../providers/popup/popup';
let WalletMnemonicRecoverPage = class WalletMnemonicRecoverPage {
    constructor(logger, navParams, form, popupProvider, translate, bwcProvider, errorsProvider) {
        this.logger = logger;
        this.navParams = navParams;
        this.form = form;
        this.popupProvider = popupProvider;
        this.translate = translate;
        this.bwcProvider = bwcProvider;
        this.errorsProvider = errorsProvider;
        this.mnemonicPhrase = '';
        this.mnemonicEncrypted =
            this.navParams.data.credential.mnemonic === undefined;
        if (!this.mnemonicEncrypted) {
            this.mnemonicPhrase = this.navParams.data.credential.mnemonic;
        }
        this.title = this.navParams.data.name;
        this.passwordForm = this.form.group({
            encryptPassword: [null]
        });
    }
    decryptMnemonic() {
        if (!this.passwordForm.valid) {
            const title = this.translate.instant('Error');
            const subtitle = this.translate.instant('There is an error in the form');
            this.popupProvider.ionicAlert(title, subtitle);
            return;
        }
        else {
            this._decryptMnemonic(this.passwordForm.value.encryptPassword, this.navParams.data.credential);
        }
    }
    _decryptMnemonic(password, credential) {
        let mnemonic = '';
        if (!credential.xPrivKeyEncrypted)
            throw new Error('Private key is not encrypted');
        try {
            if (credential.mnemonicEncrypted) {
                mnemonic = this.bwcProvider
                    .getSJCL()
                    .decrypt(password, credential.mnemonicEncrypted);
                this.mnemonicPhrase = mnemonic;
                this.mnemonicEncrypted = false;
            }
        }
        catch (ex) {
            this.showErrorInfoSheet('Could Not Decrypt', 'Error');
        }
    }
    showErrorInfoSheet(err, infoSheetTitle) {
        if (!err)
            return;
        this.logger.error('Could not get keys:', err);
        this.errorsProvider.showDefaultError(err, infoSheetTitle);
    }
};
WalletMnemonicRecoverPage = __decorate([
    Component({
        selector: 'wallet-mnemonic-recover-page',
        templateUrl: 'wallet-mnemonic-recover-page.html'
    }),
    __metadata("design:paramtypes", [Logger,
        NavParams,
        FormBuilder,
        PopupProvider,
        TranslateService,
        BwcProvider,
        ErrorsProvider])
], WalletMnemonicRecoverPage);
export { WalletMnemonicRecoverPage };
//# sourceMappingURL=wallet-mnemonic-recover-page.js.map