import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
let GiftCardDiscountText = class GiftCardDiscountText {
    constructor() {
        this.showConcisePercentage = false;
        this.numberOnly = false;
        this.math = Math;
    }
    ngOnInit() {
        const cardConfig = (this.merchant &&
            this.merchant.giftCards[0] &&
            this.merchant.giftCards[0]) ||
            this.cardConfig;
        this.currency =
            this.discount.currency || (cardConfig && cardConfig.currency);
    }
    shouldShowConcisePercentage(discount) {
        return this.showConcisePercentage && discount.amount >= 1;
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], GiftCardDiscountText.prototype, "discount", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], GiftCardDiscountText.prototype, "cardConfig", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], GiftCardDiscountText.prototype, "merchant", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], GiftCardDiscountText.prototype, "showConcisePercentage", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], GiftCardDiscountText.prototype, "numberOnly", void 0);
GiftCardDiscountText = __decorate([
    Component({
        selector: 'gift-card-discount-text',
        template: `
    <span *ngIf="discount.type === 'flatrate'">{{
      discount.amount | formatCurrency: currency:'minimal'
    }}</span>
    <span *ngIf="discount.type === 'percentage'">
      <span *ngIf="shouldShowConcisePercentage(discount)"
        >{{ math.floor(discount.amount) }}%</span
      >
      <span *ngIf="!shouldShowConcisePercentage(discount)"
        >{{ discount.amount }}%</span
      >
    </span>
    <span
      *ngIf="!numberOnly && ['flatrate', 'percentage'].includes(discount.type)"
      >Off Every Purchase</span
    >
    <span *ngIf="discount.type === 'custom'">{{
      discount.value || 'Discount Available'
    }}</span>
  `
    }),
    __metadata("design:paramtypes", [])
], GiftCardDiscountText);
export { GiftCardDiscountText };
//# sourceMappingURL=gift-card-discount-text.js.map