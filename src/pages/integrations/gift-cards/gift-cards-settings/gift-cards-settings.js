import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';
import { ConfigProvider, GiftCardProvider, HomeIntegrationsProvider } from '../../../../providers';
import { GiftCardSettingsPage } from '../gift-card-settings/gift-card-settings';
let GiftCardsSettingsPage = class GiftCardsSettingsPage {
    constructor(configProvider, giftCardProvider, homeIntegrationsProvider, nav) {
        this.configProvider = configProvider;
        this.giftCardProvider = giftCardProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.nav = nav;
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.showAtHome = this.homeIntegrationsProvider.shouldShowInHome('giftcards');
            const purchasedCards = yield this.giftCardProvider.getPurchasedBrands();
            this.purchasedBrands = _.uniqBy(purchasedCards, ([cards]) => cards.displayName);
        });
    }
    goToCardSettings(cardName) {
        this.nav.push(GiftCardSettingsPage, { cardName });
    }
    integrationChange() {
        this.homeIntegrationsProvider.updateConfig('giftcards', this.showAtHome);
        this.configProvider.set({
            showIntegration: { giftcards: this.showAtHome }
        });
    }
};
GiftCardsSettingsPage = __decorate([
    Component({
        selector: 'gift-cards-settings-page',
        templateUrl: 'gift-cards-settings.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        GiftCardProvider,
        HomeIntegrationsProvider,
        NavController])
], GiftCardsSettingsPage);
export { GiftCardsSettingsPage };
//# sourceMappingURL=gift-cards-settings.js.map