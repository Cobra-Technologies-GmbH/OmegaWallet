import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Input } from '@angular/core';
import { AppProvider } from '../../providers/app/app';
let IonContentBackgroundColor = class IonContentBackgroundColor {
    constructor(element, app) {
        this.element = element;
        this.app = app;
    }
    ngOnChanges() {
        this.setContentBackgroundColor(this.color);
    }
    setContentBackgroundColor(color) {
        const ionContent = this.element.nativeElement.getElementsByClassName('fixed-content')[0];
        if (color)
            ionContent.style.setProperty('background-color', color);
        else {
            const color = this.app.info.nameCase == 'Copay' ? '#192c3a' : '#2a3f90';
            ionContent.style.setProperty('background-color', color);
        }
    }
};
__decorate([
    Input('ion-content-background-color'),
    __metadata("design:type", String)
], IonContentBackgroundColor.prototype, "color", void 0);
IonContentBackgroundColor = __decorate([
    Directive({
        selector: '[ion-content-background-color]',
        host: { class: 'ion-content-background-color' }
    }),
    __metadata("design:paramtypes", [ElementRef, AppProvider])
], IonContentBackgroundColor);
export { IonContentBackgroundColor };
//# sourceMappingURL=ion-content-background-color.js.map