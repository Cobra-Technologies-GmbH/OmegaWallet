import { __decorate, __metadata } from "tslib";
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
let SlideToAcceptPage = class SlideToAcceptPage {
    constructor(navCtrl, navParams, renderer) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.renderer = renderer;
        this.slideDone = new EventEmitter();
        this.isPressed = false;
        this.delta = 8;
        this.done = false;
        this.isDisabled = false;
        this.isConfirm = false;
    }
    set disabled(disabled) {
        this.isDisabled = disabled !== undefined ? disabled : false;
    }
    get disabled() {
        return this.isDisabled;
    }
    set slideButtonDone(done) {
        this.done = done !== undefined ? done : false;
    }
    get slideButtonDone() {
        return this.done;
    }
    ngOnChanges(changes) {
        if (changes &&
            changes.disabled &&
            changes.disabled.previousValue === true &&
            changes.disabled.firstChange === false) {
            this.animation = false;
            setTimeout(() => {
                this.toggleAnimation();
            }, 300);
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.htmlButtonElem = this.buttonElement.nativeElement;
            this.htmlContainerElem = this.containerElement.nativeElement;
            this.htmlTextElem = this.textElement.nativeElement;
            this.htmlArrowElem = this.arrowElement.nativeElement;
            let buttonConstraints = this.htmlButtonElem.getBoundingClientRect();
            this.origin = {
                left: buttonConstraints.left,
                top: buttonConstraints.top,
                width: buttonConstraints.width
            };
            this.containerWidth = this.htmlContainerElem.clientWidth;
            const subtract = this.containerWidth < 800 ? 75 : 200;
            this.xMax = this.containerWidth - subtract;
        }, 0);
    }
    activateButton(event) {
        this.isPressed = true;
        if (typeof event.touches != 'undefined') {
            this.clickPosition = event.touches[0].pageX;
        }
    }
    dragButton(event) {
        if (typeof event.touches != 'undefined') {
            let xTranslate = event.touches[0].pageX;
            let xDisplacement = this.isPressed ? xTranslate - this.clickPosition : 0;
            // Adjust displacement to consider the delta value
            xDisplacement -= this.delta;
            // Use resource inexpensive translation to perform the sliding
            let posCss = {
                transform: 'translateX(' + xDisplacement + 'px)',
                '-webkit-transform': 'translateX(' + xDisplacement + 'px)'
            };
            let opacityCss = (xDisplacement > 0
                ? 1 - xDisplacement / 200
                : 1).toFixed(2);
            // Move the element while the drag position is less than xMax
            // -delta/2 is a necessary adjustment
            if (xDisplacement >= 0 &&
                xDisplacement <
                    this.containerWidth - (this.origin.width * 30) / 100 + 30 &&
                this.isPressed) {
                // Set element styles
                this.renderer.setStyle(this.htmlButtonElem, 'transform', posCss['transform']);
                this.renderer.setStyle(this.htmlButtonElem, '-webkit-transform', posCss['-webkit-transform']);
                this.renderer.setStyle(this.htmlTextElem, 'opacity', opacityCss);
                this.renderer.setStyle(this.htmlArrowElem, 'opacity', opacityCss);
            }
            // If the max displacement position is reached
            this.slideButtonDone =
                xDisplacement >= this.xMax - this.delta / 2 ? true : false;
        }
    }
    resetButton() {
        // Only reset if button sliding is not done yet
        if (!this.slideButtonDone || this.isDisabled) {
            this.isConfirm = false;
            // Reset state variables
            // Resets button position
            let posCss = {
                transform: 'translateX(0px)',
                '-webkit-transform': 'translateX(0px)'
            };
            this.renderer.setStyle(this.htmlButtonElem, 'transform', posCss['transform']);
            this.renderer.setStyle(this.htmlButtonElem, '-webkit-transform', posCss['-webkit-transform']);
            this.renderer.setStyle(this.htmlTextElem, 'opacity', '1');
            this.renderer.setStyle(this.htmlArrowElem, 'opacity', '1');
            this.ngAfterViewInit();
        }
        else if (this.slideButtonDone && !this.isDisabled) {
            this.isConfirm = true;
            this.slideButtonDone = false;
            this.slideDone.emit(true);
        }
    }
    isConfirmed(boolean) {
        if (!boolean) {
            this.resetButton();
        }
    }
    toggleAnimation() {
        if (this.isDisabled)
            return;
        this.animation = true;
        setTimeout(() => {
            this.animation = false;
        }, 300);
    }
};
__decorate([
    Output(),
    __metadata("design:type", Object)
], SlideToAcceptPage.prototype, "slideDone", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], SlideToAcceptPage.prototype, "buttonText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], SlideToAcceptPage.prototype, "disabled", null);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], SlideToAcceptPage.prototype, "slideButtonDone", null);
__decorate([
    ViewChild('slideButton', { read: ElementRef }),
    __metadata("design:type", ElementRef)
], SlideToAcceptPage.prototype, "buttonElement", void 0);
__decorate([
    ViewChild('slideButtonContainer'),
    __metadata("design:type", ElementRef)
], SlideToAcceptPage.prototype, "containerElement", void 0);
__decorate([
    ViewChild('slideText', { read: ElementRef }),
    __metadata("design:type", ElementRef)
], SlideToAcceptPage.prototype, "textElement", void 0);
__decorate([
    ViewChild('slideArrow', { read: ElementRef }),
    __metadata("design:type", ElementRef)
], SlideToAcceptPage.prototype, "arrowElement", void 0);
SlideToAcceptPage = __decorate([
    Component({
        selector: 'page-slide-to-accept',
        templateUrl: 'slide-to-accept.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Renderer2])
], SlideToAcceptPage);
export { SlideToAcceptPage };
//# sourceMappingURL=slide-to-accept.js.map