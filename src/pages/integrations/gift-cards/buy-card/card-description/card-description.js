import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { hasPromotion } from '../../../../../providers/gift-card/gift-card';
let CardDescriptionComponent = class CardDescriptionComponent {
    constructor() {
        this.hasPromotion = hasPromotion;
    }
    prepForMarkdown(markdown) {
        return markdown && markdown.replace(/•/gm, '-');
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CardDescriptionComponent.prototype, "cardConfig", void 0);
CardDescriptionComponent = __decorate([
    Component({
        selector: 'card-description',
        templateUrl: 'card-description.html'
    })
], CardDescriptionComponent);
export { CardDescriptionComponent };
//# sourceMappingURL=card-description.js.map