import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { PlatformProvider } from '../../../providers';
let WideHeaderBarButton = class WideHeaderBarButton {
    constructor(element, platformProvider, renderer) {
        this.element = element;
        this.platformProvider = platformProvider;
        this.renderer = renderer;
        this.platformName = 'md';
        this.platformName = this.platformProvider.isIOS ? 'ios' : 'md';
    }
    ngAfterViewInit() {
        const cssClasses = [
            'bar-button',
            `bar-button-${this.platformName}`,
            'bar-button-default',
            `bar-button-default-${this.platformName}`
        ];
        cssClasses.forEach(c => this.addClass(c));
    }
    addClass(cssClass) {
        this.renderer.addClass(this.element.nativeElement, cssClass);
    }
};
WideHeaderBarButton = __decorate([
    Directive({
        selector: '[wide-header-bar-button]'
    }),
    __metadata("design:paramtypes", [ElementRef,
        PlatformProvider,
        Renderer2])
], WideHeaderBarButton);
export { WideHeaderBarButton };
//# sourceMappingURL=wide-header-bar-button.js.map