import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { GiftCardProvider } from '../../../../../providers/gift-card/gift-card';
let GiftCardItem = class GiftCardItem {
    constructor(giftCardProvider, renderer) {
        this.giftCardProvider = giftCardProvider;
        this.renderer = renderer;
        this.giftCards = [];
        this.action = new EventEmitter();
    }
    ngAfterViewInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cardName && this.setBrandStyling();
            this.currentCards = this.giftCards.filter(g => !g.archived);
            this.currency = this.currentCards[0].currency;
            this.numCurrencies = getNumCurrencies(this.currentCards);
            this.totalBalance = this.currentCards.reduce((sum, card) => sum + card.amount, 0);
        });
    }
    performAction(action) {
        this.action.emit({
            cardName: this.cardName,
            action
        });
    }
    shouldShowTotalBalance() {
        return this.cardConfig && this.numCurrencies === 1 && this.totalBalance;
    }
    setBrandStyling() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cardConfig = yield this.giftCardProvider.getCardConfig(this.cardName);
            const isGradient = this.cardConfig.logoBackgroundColor.indexOf('gradient') > -1;
            const cssProperty = isGradient ? 'background-image' : 'background-color';
            this.renderer.setStyle(this.card.nativeElement, cssProperty, this.cardConfig.logoBackgroundColor);
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], GiftCardItem.prototype, "cardName", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], GiftCardItem.prototype, "giftCards", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], GiftCardItem.prototype, "action", void 0);
__decorate([
    ViewChild('card'),
    __metadata("design:type", ElementRef)
], GiftCardItem.prototype, "card", void 0);
GiftCardItem = __decorate([
    Component({
        selector: 'gift-card-item',
        templateUrl: 'gift-card-item.html'
    }),
    __metadata("design:paramtypes", [GiftCardProvider,
        Renderer2])
], GiftCardItem);
export { GiftCardItem };
function getNumCurrencies(cards) {
    const currencies = cards.map(c => c.currency);
    const uniqueCurrencies = _.uniq(currencies);
    return uniqueCurrencies.length;
}
//# sourceMappingURL=gift-card-item.js.map