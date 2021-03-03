import { __decorate, __metadata } from "tslib";
import { Component, ContentChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { Content } from 'ionic-angular';
let ExpandableHeaderPrimaryComponent = class ExpandableHeaderPrimaryComponent {
    constructor(element) {
        this.element = element;
    }
};
ExpandableHeaderPrimaryComponent = __decorate([
    Component({
        selector: 'expandable-header-primary',
        template: '<ng-content></ng-content>'
    }),
    __metadata("design:paramtypes", [ElementRef])
], ExpandableHeaderPrimaryComponent);
export { ExpandableHeaderPrimaryComponent };
let ExpandableHeaderFooterComponent = class ExpandableHeaderFooterComponent {
    constructor(element) {
        this.element = element;
    }
};
ExpandableHeaderFooterComponent = __decorate([
    Component({
        selector: 'expandable-header-footer',
        template: '<ng-content></ng-content>'
    }),
    __metadata("design:paramtypes", [ElementRef])
], ExpandableHeaderFooterComponent);
export { ExpandableHeaderFooterComponent };
let ExpandableHeaderComponent = class ExpandableHeaderComponent {
    constructor(element, renderer) {
        this.element = element;
        this.renderer = renderer;
        /**
         * Determines how quickly the content fades out on scroll. The
         * greater the value, the quicker the fade.
         */
        this.fadeFactor = 2.5;
        this.disableFade = false;
    }
    ngOnInit() {
        if (this.disableFade) {
            return;
        }
        this.scrollArea.ionScroll.subscribe(event => event.domWrite(() => this.handleDomWrite(event.scrollTop)));
    }
    ngAfterViewInit() {
        this.headerHeight = this.element.nativeElement.offsetHeight;
    }
    handleDomWrite(scrollTop) {
        const newHeaderHeight = this.getNewHeaderHeight(scrollTop);
        newHeaderHeight > 0 && this.applyTransforms(scrollTop, newHeaderHeight);
    }
    applyTransforms(scrollTop, newHeaderHeight) {
        const transformations = this.computeTransformations(scrollTop, newHeaderHeight);
        this.transformContent(transformations);
    }
    getNewHeaderHeight(scrollTop) {
        const newHeaderHeight = this.headerHeight - scrollTop;
        return newHeaderHeight < 0 ? 0 : newHeaderHeight;
    }
    computeTransformations(scrollTop, newHeaderHeight) {
        const opacity = this.getScaleValue(newHeaderHeight, this.fadeFactor);
        const scale = this.getScaleValue(newHeaderHeight, 0.5);
        const translateY = scrollTop > 0 ? scrollTop / 1.5 : 0;
        return [opacity, scale, translateY];
    }
    getScaleValue(newHeaderHeight, exponent) {
        return (Math.pow(newHeaderHeight, exponent) /
            Math.pow(this.headerHeight, exponent));
    }
    transformContent(transformations) {
        const [opacity] = transformations;
        this.renderer.setStyle(this.primaryContent.element.nativeElement, 'opacity', `${opacity}`);
        this.renderer.setStyle(this.footerContent.element.nativeElement, 'opacity', `${opacity}`);
    }
};
__decorate([
    ContentChild(ExpandableHeaderPrimaryComponent),
    __metadata("design:type", ExpandableHeaderPrimaryComponent)
], ExpandableHeaderComponent.prototype, "primaryContent", void 0);
__decorate([
    ContentChild(ExpandableHeaderFooterComponent),
    __metadata("design:type", ExpandableHeaderFooterComponent)
], ExpandableHeaderComponent.prototype, "footerContent", void 0);
__decorate([
    Input('scrollArea'),
    __metadata("design:type", Content)
], ExpandableHeaderComponent.prototype, "scrollArea", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], ExpandableHeaderComponent.prototype, "fadeFactor", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], ExpandableHeaderComponent.prototype, "disableFade", void 0);
ExpandableHeaderComponent = __decorate([
    Component({
        selector: 'expandable-header',
        template: '<ng-content></ng-content>'
    }),
    __metadata("design:paramtypes", [ElementRef, Renderer2])
], ExpandableHeaderComponent);
export { ExpandableHeaderComponent };
export const EXPANDABLE_HEADER_COMPONENTS = [
    ExpandableHeaderComponent,
    ExpandableHeaderFooterComponent,
    ExpandableHeaderPrimaryComponent
];
//# sourceMappingURL=expandable-header.js.map