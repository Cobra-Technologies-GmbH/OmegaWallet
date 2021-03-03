import { __decorate, __metadata } from "tslib";
import { Component, Input, ViewChild } from '@angular/core';
import { Content, Navbar } from 'ionic-angular';
import { PlatformProvider } from '../../../providers/platform/platform';
let WideHeaderPage = class WideHeaderPage {
    constructor(platformProvider) {
        this.platformProvider = platformProvider;
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], WideHeaderPage.prototype, "headerColor", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], WideHeaderPage.prototype, "title", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], WideHeaderPage.prototype, "hideBackButton", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], WideHeaderPage.prototype, "hasSlideButton", void 0);
__decorate([
    ViewChild(Navbar),
    __metadata("design:type", Navbar)
], WideHeaderPage.prototype, "navBar", void 0);
__decorate([
    ViewChild(Content),
    __metadata("design:type", Content)
], WideHeaderPage.prototype, "scrollArea", void 0);
WideHeaderPage = __decorate([
    Component({
        selector: 'wide-header-page',
        templateUrl: 'wide-header-page.html'
    }),
    __metadata("design:paramtypes", [PlatformProvider])
], WideHeaderPage);
export { WideHeaderPage };
//# sourceMappingURL=wide-header-page.js.map