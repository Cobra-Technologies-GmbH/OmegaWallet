import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs/Subject';
export var AlertType;
(function (AlertType) {
    AlertType["info"] = "info";
    AlertType["success"] = "success";
    AlertType["warning"] = "warning";
    AlertType["danger"] = "danger";
    AlertType["love"] = "love";
    AlertType["safeguard"] = "safeguard";
})(AlertType || (AlertType = {}));
let InfoSheetTemplate = class InfoSheetTemplate {
    constructor() {
        this.type = AlertType.info;
        this.dismissSubject = new Subject();
        this.onDismiss = this.dismissSubject.asObservable();
    }
    dismiss(option) {
        this.dismissSubject.next(option);
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], InfoSheetTemplate.prototype, "type", void 0);
InfoSheetTemplate = __decorate([
    Component({
        selector: 'info-sheet-template',
        templateUrl: 'info-sheet-template.html'
    })
], InfoSheetTemplate);
export { InfoSheetTemplate };
//# sourceMappingURL=info-sheet-template.js.map