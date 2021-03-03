import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, Input, ViewChild } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { GiftCardProvider } from '../../../../providers/gift-card/gift-card';
let CardTermsComponent = class CardTermsComponent {
    constructor(giftCardProvider) {
        this.giftCardProvider = giftCardProvider;
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cardConfig = yield this.giftCardProvider.getCardConfig(this.cardName);
            const terms = this.cardConfig.terms;
            this.cardTerms =
                terms &&
                    linkifyTerms(terms)
                        .replace('Terms and Conditions', '')
                        .replace(/\n•/gm, '')
                        .replace(/\*/gm, '&ast;')
                        .replace(/[ ]{5}/gm, '');
        });
    }
};
__decorate([
    ViewChild(MarkdownComponent),
    __metadata("design:type", MarkdownComponent)
], CardTermsComponent.prototype, "markdown", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], CardTermsComponent.prototype, "cardName", void 0);
CardTermsComponent = __decorate([
    Component({
        selector: 'card-terms',
        templateUrl: 'card-terms.html'
    }),
    __metadata("design:paramtypes", [GiftCardProvider])
], CardTermsComponent);
export { CardTermsComponent };
function linkifyUrl(url) {
    return `[${url}](https://${url})`;
}
function linkifyTerms(terms) {
    const urlRegex = /[\w\/\-\:]+\.[\w\/\-\:]+((\.[\w\/\-\:]+)?)+/gm;
    const allUrls = terms.match(urlRegex) || [];
    const urlsWithoutProtocol = allUrls.filter(m => m && !m.startsWith('http') && !m.startsWith('www.') && m.length > 3);
    const termsWithPlaceholders = urlsWithoutProtocol.reduce((newTerms, url, index) => newTerms.replace(url, getPlaceholder(index)), terms);
    const linkifiedTerms = urlsWithoutProtocol.reduce((newTerms, url, index) => newTerms.replace(getPlaceholder(index), linkifyUrl(url)), termsWithPlaceholders);
    return linkifiedTerms;
}
function getPlaceholder(index) {
    return `---${index}`;
}
//# sourceMappingURL=card-terms.js.map