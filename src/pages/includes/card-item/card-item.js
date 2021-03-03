import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { TimeProvider } from '../../../providers/time/time';
let CardItemPage = class CardItemPage {
    constructor(timeProvider) {
        this.timeProvider = timeProvider;
        this.sent = false;
        this.received = false;
        this.pending = false;
    }
    set card(card) {
        this._card = card;
        if (card.pending) {
            this.pending = true;
        }
        else if (card.price.toString().indexOf('-') > -1) {
            this.sent = true;
        }
        else {
            this.received = true;
        }
    }
    get card() {
        return this._card;
    }
    set currency(c) {
        this._currency = c;
    }
    get currency() {
        return this._currency;
    }
    createdWithinPastDay(time) {
        return this.timeProvider.withinPastDay(time);
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], CardItemPage.prototype, "card", null);
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], CardItemPage.prototype, "currency", null);
CardItemPage = __decorate([
    Component({
        selector: 'page-card-item',
        templateUrl: 'card-item.html'
    }),
    __metadata("design:paramtypes", [TimeProvider])
], CardItemPage);
export { CardItemPage };
//# sourceMappingURL=card-item.js.map