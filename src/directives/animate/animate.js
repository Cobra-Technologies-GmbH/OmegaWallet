import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, Renderer2 } from '@angular/core';
let Animate = class Animate {
    constructor(el, renderer) {
        this.el = el;
        this.renderer = renderer;
    }
    animate(animationName) {
        this.renderer.addClass(this.el.nativeElement, animationName);
        setTimeout(() => {
            this.renderer.removeClass(this.el.nativeElement, animationName);
        }, 600);
    }
};
Animate = __decorate([
    Directive({
        selector: '[animate]'
    }),
    __metadata("design:paramtypes", [ElementRef, Renderer2])
], Animate);
export { Animate };
//# sourceMappingURL=animate.js.map