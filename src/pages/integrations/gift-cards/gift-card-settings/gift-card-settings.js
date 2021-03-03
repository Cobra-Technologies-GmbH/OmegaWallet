import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
import { ActionSheetProvider, GiftCardProvider, Logger, PopupProvider } from '../../../../providers';
import { PurchasedCardsPage } from '../purchased-cards/purchased-cards';
let GiftCardSettingsPage = class GiftCardSettingsPage extends PurchasedCardsPage {
    constructor(actionSheetProvider, giftCardProvider, logger, navCtrl, navParams, popupProvider, translate) {
        super(actionSheetProvider, giftCardProvider, logger, navCtrl, navParams);
        this.popupProvider = popupProvider;
        this.translate = translate;
    }
    ionViewDidLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
        });
    }
    getCards() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.giftCardProvider
                .getAllCardsOfBrand(this.cardConfig.displayName)
                .then(cards => this.setGiftCards(cards))
                .catch(err => this.logger.error(err));
            this.giftCardProvider.updatePendingGiftCards(this.currentGiftCards);
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.email = yield this.giftCardProvider.getUserEmail();
        });
    }
    setEmail() {
        let title = this.translate.instant('Enter email address');
        let message = this.translate.instant('Where would you like to receive your Amazon gift card purchase receipts?');
        let opts = { type: 'email', defaultText: this.email || '' };
        this.popupProvider.ionicPrompt(title, message, opts).then(email => {
            if (_.isNull(email))
                return;
            if (this.email == email)
                return;
            if (!_.isEmpty(email) && !this.giftCardProvider.emailIsValid(email)) {
                let t = this.translate.instant('Invalid Email');
                let ok = this.translate.instant('Try again');
                this.popupProvider.ionicAlert(t, null, ok).then(_ => {
                    this.setEmail();
                });
                return;
            }
            this.email = email;
            this.giftCardProvider.storeEmail(this.email);
        });
    }
    removePageFromHistory() {
        // Override extended behavior and don't remove page from history.
    }
};
GiftCardSettingsPage = __decorate([
    Component({
        selector: 'gift-card-settings-page',
        templateUrl: 'gift-card-settings.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        GiftCardProvider,
        Logger,
        NavController,
        NavParams,
        PopupProvider,
        TranslateService])
], GiftCardSettingsPage);
export { GiftCardSettingsPage };
//# sourceMappingURL=gift-card-settings.js.map