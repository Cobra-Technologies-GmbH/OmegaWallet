import { __decorate, __metadata } from "tslib";
import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { Animate } from './../../../directives/animate/animate';
let PinDots = class PinDots {
    constructor() {
        this.dotArray = new Array(4);
    }
    ngOnChanges(changes) {
        const pinChanges = changes.pin;
        if (!pinChanges) {
            return;
        }
        const currentValue = pinChanges.currentValue;
        const previousValue = pinChanges.previousValue;
        if (!currentValue.length || currentValue.length < previousValue.length) {
            return;
        }
        this.pulseDot(currentValue.length - 1);
    }
    isFilled(limit) {
        return this.pin && this.pin.length >= limit;
    }
    pulseDot(dotIndex) {
        const dot = this.dots.toArray()[dotIndex];
        dot.animate('pulse');
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], PinDots.prototype, "pin", void 0);
__decorate([
    ViewChildren(Animate),
    __metadata("design:type", QueryList)
], PinDots.prototype, "dots", void 0);
PinDots = __decorate([
    Component({
        selector: 'pin-dots',
        template: `
    <div
      *ngFor="let dot of dotArray; index as i"
      class="circle"
      [ngClass]="{ filled: isFilled(i + 1) }"
      animate
    ></div>
  `
    })
], PinDots);
export { PinDots };
//# sourceMappingURL=pin-dots.component.js.map