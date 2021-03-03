import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../../../providers/logger/logger';
import { ProfileProvider } from '../../../../providers/profile/profile';
import { WalletMnemonicRecoverPage } from './wallet-mnemonic-recover-page/wallet-mnemonic-recover-page';
let WalletRecoverPage = class WalletRecoverPage {
    constructor(profileProvider, navCtrl, logger) {
        this.profileProvider = profileProvider;
        this.navCtrl = navCtrl;
        this.logger = logger;
    }
    ionViewWillEnter() {
        this.profileProvider.getProfileLegacy().then(oldProfile => {
            if (!oldProfile)
                return;
            this.logger.debug(`Legacy profile exist. Typeof: ${typeof oldProfile}`);
            if (_.isString(oldProfile)) {
                oldProfile = JSON.parse(oldProfile);
            }
            this.wallets = _.filter(oldProfile.credentials, value => {
                return value && (value.mnemonic || value.mnemonicEncrypted);
            });
            this.logger.debug(`${this.wallets.length} wallets with mnemonics found in legacy profile`);
        });
    }
    openWalletMnemonicRecoverPage(name, credential) {
        this.navCtrl.push(WalletMnemonicRecoverPage, { name, credential });
    }
};
WalletRecoverPage = __decorate([
    Component({
        selector: 'wallet-recover-page',
        templateUrl: 'wallet-recover-page.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        NavController,
        Logger])
], WalletRecoverPage);
export { WalletRecoverPage };
//# sourceMappingURL=wallet-recover-page.js.map