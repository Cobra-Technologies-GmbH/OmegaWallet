import { __awaiter, __decorate, __metadata } from "tslib";
import { Directive, Input } from '@angular/core';
import { TextInput } from 'ionic-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createTextMaskInputElement } from 'text-mask-core';
let IonMask = class IonMask {
    constructor(ionInput) {
        this.ionInput = ionInput;
        this.mask = [];
        this.clearInputListeners = new Subject();
    }
    ngOnInit() {
        this.configureInput();
    }
    ngOnChanges() {
        this.clearInputListeners.next();
        if (this.mask)
            this.configureInput();
    }
    ngOnDestroy() {
        this.clearInputListeners.next();
    }
    configureInput() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = yield this.ionInput.getNativeElement();
            const maskedInput = createTextMaskInputElement({
                inputElement: input,
                mask: this.mask,
                guide: false
            });
            maskedInput.update(this.ionInput.value);
            this.ionInput.value = input.value;
            this.ionInput.ionChange
                .pipe(takeUntil(this.clearInputListeners))
                .subscribe((event) => {
                const { value } = event;
                maskedInput.update(value);
                this.ionInput.value = input.value;
            });
        });
    }
};
__decorate([
    Input('ionMask'),
    __metadata("design:type", Array)
], IonMask.prototype, "mask", void 0);
IonMask = __decorate([
    Directive({
        selector: '[ionMask]',
        providers: [TextInput]
    }),
    __metadata("design:paramtypes", [TextInput])
], IonMask);
export { IonMask };
//# sourceMappingURL=ion-mask.js.map