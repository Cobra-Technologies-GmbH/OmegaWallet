import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { BitPayCardProvider } from '../bitpay-card/bitpay-card';
import { GiftCardProvider } from '../gift-card/gift-card';
let TabProvider = class TabProvider {
    constructor(bitPayCardProvider, giftCardProvider) {
        this.bitPayCardProvider = bitPayCardProvider;
        this.giftCardProvider = giftCardProvider;
    }
    prefetchBitpayCardItems() {
        this.bitpayCardItemsPromise = this.bitPayCardProvider.get({
            noHistory: true
        });
        return this.bitpayCardItemsPromise;
    }
    prefetchGiftCards() {
        this.activeGiftCardsPromise = this.giftCardProvider.getActiveCards();
        return this.activeGiftCardsPromise;
    }
    prefetchCards() {
        return Promise.all([
            this.prefetchBitpayCardItems(),
            this.prefetchGiftCards()
        ]);
    }
};
TabProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [BitPayCardProvider,
        GiftCardProvider])
], TabProvider);
export { TabProvider };
//# sourceMappingURL=tab.js.map