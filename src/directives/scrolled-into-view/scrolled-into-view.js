import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Content } from 'ionic-angular';
let ScrolledIntoView = class ScrolledIntoView {
    constructor(elm) {
        this.elm = elm;
        this.inView = false;
        this.viewEnter = new EventEmitter();
    }
    ngAfterViewInit() {
        this.checkIfElementInView();
        this.scrollArea.ionScroll.subscribe(() => this.checkIfElementInView());
    }
    checkIfElementInView() {
        const scanButtonAreaHeight = 70;
        const { scrollTop, contentHeight } = this.scrollArea;
        const { offsetTop, offsetHeight } = this.elm.nativeElement;
        if (scrollTop + contentHeight - scanButtonAreaHeight >
            offsetTop + offsetHeight) {
            if (this.inView)
                return;
            this.viewEnter.emit(true);
            this.inView = true;
        }
    }
};
__decorate([
    Input('scrollArea'),
    __metadata("design:type", Content)
], ScrolledIntoView.prototype, "scrollArea", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], ScrolledIntoView.prototype, "viewEnter", void 0);
ScrolledIntoView = __decorate([
    Directive({
        selector: '[scrolled-into-view]'
    }),
    __metadata("design:paramtypes", [ElementRef])
], ScrolledIntoView);
export { ScrolledIntoView };
//# sourceMappingURL=scrolled-into-view.js.map