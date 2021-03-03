import { __awaiter, __decorate, __metadata } from "tslib";
import { ViewChild } from '@angular/core';
import { ActionSheetComponent } from './action-sheet';
export class ActionSheetParent {
    present(params = {
        maxHeight: '90vh',
        minHeight: 'unset'
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.actionSheet.present(this.componentRef, params);
        });
    }
    dismiss(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionSheet.dismiss(data);
        });
    }
    onDidDismiss(func) {
        this.dismissFunction = func;
        this.actionSheet.dismissFunction = func;
    }
}
__decorate([
    ViewChild(ActionSheetComponent),
    __metadata("design:type", ActionSheetComponent)
], ActionSheetParent.prototype, "actionSheet", void 0);
//# sourceMappingURL=action-sheet-parent.js.map