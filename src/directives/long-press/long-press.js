import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef, EventEmitter, Output } from '@angular/core';
import { Gesture } from 'ionic-angular/gestures/gesture';
let LongPress = class LongPress {
    constructor(el) {
        this.longPress = new EventEmitter();
        this.el = el.nativeElement;
    }
    ngOnInit() {
        this.pressGesture = new Gesture(this.el, {
            recognizers: [[Hammer.Press, { time: 1000 }]]
        });
        this.pressGesture.listen();
        this.pressGesture.on('press', e => {
            this.longPress.emit(e);
        });
    }
    ngOnDestroy() {
        this.pressGesture.destroy();
    }
};
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], LongPress.prototype, "longPress", void 0);
LongPress = __decorate([
    Directive({
        selector: '[longPress]'
    }),
    __metadata("design:paramtypes", [ElementRef])
], LongPress);
export { LongPress };
//# sourceMappingURL=long-press.js.map