import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Input } from '@angular/core';
/*
Ionic does not currently appear to provide an API to set the navbar background
to an arbitrary color. This directive enables this functionality.
*/
let NavbarBg = class NavbarBg {
    constructor(element) {
        this.element = element;
    }
    ngOnChanges() {
        this.setNewNavbarColor(this.color);
    }
    setNewNavbarColor(color) {
        const toolbarBg = this.element.nativeElement.getElementsByClassName('toolbar-background')[0];
        color
            ? toolbarBg.style.setProperty('background', color, 'important')
            : toolbarBg.style.removeProperty('background');
    }
};
__decorate([
    Input('navbar-bg'),
    __metadata("design:type", String)
], NavbarBg.prototype, "color", void 0);
NavbarBg = __decorate([
    Directive({
        selector: '[navbar-bg]'
    }),
    __metadata("design:paramtypes", [ElementRef])
], NavbarBg);
export { NavbarBg };
//# sourceMappingURL=navbar-bg.js.map