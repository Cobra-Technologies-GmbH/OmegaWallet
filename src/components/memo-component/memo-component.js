import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let MemoComponent = class MemoComponent extends ActionSheetParent {
    constructor(formBuilder) {
        super();
        this.formBuilder = formBuilder;
        this.memoForm = this.formBuilder.group({
            memo: ['']
        });
    }
    ngOnInit() {
        this.memoForm.setValue({
            memo: this.params.memo || ''
        });
    }
    optionClicked() {
        this.dismiss(this.memoForm.value.memo);
    }
};
MemoComponent = __decorate([
    Component({
        selector: 'memo-component',
        templateUrl: 'memo-component.html'
    }),
    __metadata("design:paramtypes", [FormBuilder])
], MemoComponent);
export { MemoComponent };
//# sourceMappingURL=memo-component.js.map