import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
let GravatarPage = class GravatarPage {
    constructor() { }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], GravatarPage.prototype, "email", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], GravatarPage.prototype, "name", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GravatarPage.prototype, "height", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], GravatarPage.prototype, "width", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], GravatarPage.prototype, "coin", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], GravatarPage.prototype, "network", void 0);
GravatarPage = __decorate([
    Component({
        selector: 'gravatar',
        templateUrl: 'gravatar.html'
    }),
    __metadata("design:paramtypes", [])
], GravatarPage);
export { GravatarPage };
//# sourceMappingURL=gravatar.js.map