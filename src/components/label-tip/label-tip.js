import { __decorate, __metadata } from "tslib";
import { Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { AlertType } from '../info-sheet/info-sheet-template';
let LabelTip = class LabelTip {
    constructor(element, renderer) {
        this.element = element;
        this.renderer = renderer;
    }
    ngOnChanges() {
        this.renderer.addClass(this.element.nativeElement, this.type);
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], LabelTip.prototype, "type", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], LabelTip.prototype, "header", void 0);
LabelTip = __decorate([
    Component({
        selector: 'label-tip',
        template: `
    <div class="label-header" *ngIf="header !== 'no-header'">
      <img
        *ngIf="type === 'info'"
        class="label-header__icon"
        src="assets/img/icon-info-blue.svg"
      />
      <img
        *ngIf="type === 'warn'"
        class="label-header__icon"
        src="assets/img/icon-warning-circled.svg"
      />
      <img
        *ngIf="type === 'danger'"
        class="label-header__icon"
        src="assets/img/icon-danger.svg"
      />
      <ng-content select="[label-tip-title]"></ng-content>
    </div>
    <div
      [ngClass]="{
        blue: type === 'info',
        yellow: type == 'warn',
        red: type == 'danger'
      }"
    >
      <ng-content select="[label-tip-body]"></ng-content>
    </div>
  `
    }),
    __metadata("design:paramtypes", [ElementRef, Renderer2])
], LabelTip);
export { LabelTip };
//# sourceMappingURL=label-tip.js.map