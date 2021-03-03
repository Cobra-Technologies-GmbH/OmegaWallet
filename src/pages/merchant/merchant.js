import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { ExternalLinkProvider, ThemeProvider } from '../../providers';
import { getDiscountTextColor } from '../../providers/merchant/merchant';
let MerchantPage = class MerchantPage {
    constructor(externalLinkProvider, navParams, themeProvider) {
        this.externalLinkProvider = externalLinkProvider;
        this.navParams = navParams;
        this.themeProvider = themeProvider;
        this.getDiscountTextColor = getDiscountTextColor;
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.merchant = this.navParams.get('merchant');
        });
    }
    goToMerchant() {
        const url = this.merchant.cta
            ? this.merchant.cta.link
            : this.merchant.domains[0];
        this.externalLinkProvider.open(url);
    }
};
MerchantPage = __decorate([
    Component({
        selector: 'merchant-page',
        templateUrl: 'merchant.html'
    }),
    __metadata("design:paramtypes", [ExternalLinkProvider,
        NavParams,
        ThemeProvider])
], MerchantPage);
export { MerchantPage };
//# sourceMappingURL=merchant.js.map