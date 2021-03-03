import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
// providers
import { BwcErrorProvider } from '../../../../providers/bwc-error/bwc-error';
import { ErrorsProvider } from '../../../../providers/errors/errors';
import { KeyProvider } from '../../../../providers/key/key';
import { Logger } from '../../../../providers/logger/logger';
import { ProfileProvider } from '../../../../providers/profile/profile';
let ExtendedPrivateKeyPage = class ExtendedPrivateKeyPage {
    constructor(profileProvider, logger, navParams, navCtrl, translate, bwcErrorProvider, keyProvider, errorsProvider) {
        this.profileProvider = profileProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.navCtrl = navCtrl;
        this.translate = translate;
        this.bwcErrorProvider = bwcErrorProvider;
        this.keyProvider = keyProvider;
        this.errorsProvider = errorsProvider;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: WalletExtendedPrivateKeyPage');
    }
    ionViewWillEnter() {
        this.keyId = this.navParams.data.keyId;
        this.walletsGroup = this.profileProvider.getWalletGroup(this.keyId);
        this.keysEncrypted = this.walletsGroup.isPrivKeyEncrypted;
    }
    ionViewDidEnter() {
        this.keyProvider
            .handleEncryptedWallet(this.keyId)
            .then((password) => {
            const keys = this.keyProvider.get(this.keyId, password);
            this.xPrivKey = keys.xPrivKey;
            this.keysEncrypted = false;
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
    showErrorInfoSheet(err, infoSheetTitle) {
        if (!err)
            return;
        this.logger.error('Could not get keys:', err);
        this.errorsProvider.showDefaultError(err, infoSheetTitle);
    }
};
ExtendedPrivateKeyPage = __decorate([
    Component({
        selector: 'page-extended-private-key',
        templateUrl: 'extended-private-key.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        Logger,
        NavParams,
        NavController,
        TranslateService,
        BwcErrorProvider,
        KeyProvider,
        ErrorsProvider])
], ExtendedPrivateKeyPage);
export { ExtendedPrivateKeyPage };
//# sourceMappingURL=extended-private-key.js.map