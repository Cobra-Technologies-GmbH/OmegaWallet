import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';
// providers
import { ProfileProvider } from '../../../../providers/profile/profile';
let KeyNamePage = class KeyNamePage {
    constructor(profileProvider, navCtrl, navParams, formBuilder, logger, translate) {
        this.profileProvider = profileProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.formBuilder = formBuilder;
        this.logger = logger;
        this.translate = translate;
        this.walletGroupNameForm = this.formBuilder.group({
            walletGroupName: [
                '',
                Validators.compose([Validators.minLength(1), Validators.required])
            ]
        });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: KeyNamePage');
    }
    ionViewWillEnter() {
        this.walletGroup = this.profileProvider.getWalletGroup(this.navParams.data.keyId);
        this.walletGroupNameForm.value.walletGroupName = this.walletGroup.name;
        this.description = this.translate.instant('You can change the name displayed on this device below.');
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            this.profileProvider.setWalletGroupName(this.navParams.data.keyId, this.walletGroupNameForm.value.walletGroupName);
            this.navCtrl.pop();
        });
    }
};
KeyNamePage = __decorate([
    Component({
        selector: 'page-key-name',
        templateUrl: 'key-name.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        NavController,
        NavParams,
        FormBuilder,
        Logger,
        TranslateService])
], KeyNamePage);
export { KeyNamePage };
//# sourceMappingURL=key-name.js.map