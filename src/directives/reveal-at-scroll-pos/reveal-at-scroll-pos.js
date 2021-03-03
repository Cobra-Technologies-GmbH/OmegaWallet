import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { Content } from 'ionic-angular';
let RevealAtScrollPosition = class RevealAtScrollPosition {
    constructor(element, renderer) {
        this.element = element;
        this.renderer = renderer;
        this.scrollPositionOfLastStyleUpdate = 0;
        this.animationDistance = 28;
    }
    ngAfterViewInit() {
        this.setInitialStyles();
        this.scrollArea.ionScroll.subscribe(event => this.shouldUpdateStyling(event.scrollTop) &&
            this.updateStyling(event.scrollTop));
    }
    shouldUpdateStyling(scrollTop) {
        return (scrollTop < this.scrollThreshold ||
            (scrollTop > this.scrollThreshold &&
                this.scrollPositionOfLastStyleUpdate < this.scrollThreshold));
    }
    setInitialStyles() {
        this.setOpacity(0);
        this.renderer.addClass(this.element.nativeElement, 'ellipsis');
    }
    updateStyling(scrollTop) {
        const opacity = this.getOpacity(scrollTop);
        const translateX = this.getTranslation(scrollTop);
        this.setOpacity(opacity);
        this.setTransform(translateX);
        this.scrollPositionOfLastStyleUpdate = scrollTop;
    }
    setOpacity(opacity) {
        this.renderer.setStyle(this.element.nativeElement, 'opacity', opacity.toFixed(3));
    }
    setTransform(translateX) {
        this.renderer.setStyle(this.element.nativeElement, 'transform', `translateX(${translateX}px)`);
    }
    getOpacity(scrollTop) {
        const finalOpacity = 1;
        const fadeStartPosition = this.scrollThreshold - this.animationDistance;
        const m = finalOpacity / (this.scrollThreshold - fadeStartPosition);
        const opacity = m * (scrollTop - this.scrollThreshold) + finalOpacity;
        return opacity;
    }
    getTranslation(scrollTop) {
        /*
        point-slope-form
        y-y1 = m(x-x1)
        y = m(x-x1) + y1
          where m = (y2 - y1) / (x2 - x1)
    
        initialTranslateX = -10
        finalTranslateX = 0
        p1 = (scrollThreshold, finalTranslateX)
        p2 = (animationStartPos, initialTranslateX)
        */
        const initialTranslateX = -10;
        const finalTranslateX = 0;
        const animationStartPos = this.scrollThreshold - this.animationDistance;
        const m = (initialTranslateX - finalTranslateX) /
            (animationStartPos - this.scrollThreshold);
        const translateX = m * (scrollTop - this.scrollThreshold) + 0;
        return translateX > 0 ? 0 : translateX;
    }
};
__decorate([
    Input('reveal-at-scroll-pos'),
    __metadata("design:type", Number)
], RevealAtScrollPosition.prototype, "scrollThreshold", void 0);
__decorate([
    Input('scrollArea'),
    __metadata("design:type", Content)
], RevealAtScrollPosition.prototype, "scrollArea", void 0);
RevealAtScrollPosition = __decorate([
    Directive({
        selector: '[reveal-at-scroll-pos]'
    }),
    __metadata("design:paramtypes", [ElementRef, Renderer2])
], RevealAtScrollPosition);
export { RevealAtScrollPosition };
//# sourceMappingURL=reveal-at-scroll-pos.js.map