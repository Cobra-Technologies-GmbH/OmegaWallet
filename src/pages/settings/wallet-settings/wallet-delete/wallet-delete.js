import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
// providers
import { KeyProvider } from '../../../../providers/key/key';
import { Logger } from '../../../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../../../providers/on-going-process/on-going-process';
import { PopupProvider } from '../../../../providers/popup/popup';
import { ProfileProvider } from '../../../../providers/profile/profile';
import { PushNotificationsProvider } from '../../../../providers/push-notifications/push-notifications';
let WalletDeletePage = class WalletDeletePage {
    constructor(profileProvider, navCtrl, navParams, popupProvider, onGoingProcessProvider, logger, translate, keyProvider, pushNotificationsProvider) {
        this.profileProvider = profileProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.popupProvider = popupProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.logger = logger;
        this.translate = translate;
        this.keyProvider = keyProvider;
        this.pushNotificationsProvider = pushNotificationsProvider;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: WalletDeletePage');
    }
    ionViewWillEnter() {
        const walletId = this.navParams.data.walletId;
        this.keyId = this.navParams.data.keyId;
        this.wallet = this.profileProvider.getWallet(walletId);
    }
    showDeletePopup() {
        const title = this.translate.instant('Warning!');
        const message = this.translate.instant('Are you sure you want to delete this wallet?');
        this.popupProvider.ionicConfirm(title, message, null, null).then(res => {
            if (res)
                this.deleteWallet();
        });
    }
    deleteWallet() {
        this.onGoingProcessProvider.set('deletingWallet');
        this.profileProvider.removeProfileLegacy();
        this.profileProvider
            .deleteWalletClient(this.wallet)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            this.onGoingProcessProvider.clear();
            this.pushNotificationsProvider.unsubscribe(this.wallet);
            const keyInUse = this.profileProvider.isKeyInUse(this.keyId);
            if (!keyInUse) {
                this.keyProvider.removeKey(this.keyId);
                this.goHome();
            }
            else {
                this.logger.warn('Key was not removed. Still in use');
                this.goHome();
            }
        }))
            .catch(err => {
            this.onGoingProcessProvider.clear();
            this.logger.warn('Could not remove all wallet data: ', err);
            this.popupProvider.ionicAlert(this.translate.instant('Error'), err.message || err);
        });
    }
    goHome() {
        setTimeout(() => {
            this.navCtrl.popToRoot();
        }, 1000);
    }
};
WalletDeletePage = __decorate([
    Component({
        selector: 'page-wallet-delete',
        templateUrl: 'wallet-delete.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        NavController,
        NavParams,
        PopupProvider,
        OnGoingProcessProvider,
        Logger,
        TranslateService,
        KeyProvider,
        PushNotificationsProvider])
], WalletDeletePage);
export { WalletDeletePage };
//# sourceMappingURL=wallet-delete.js.map