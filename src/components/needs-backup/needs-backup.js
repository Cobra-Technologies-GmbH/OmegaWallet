import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { InfoSheetComponent } from '../../components/info-sheet/info-sheet';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
import { DomProvider } from '../../providers/dom/dom';
let NeedsBackupComponent = class NeedsBackupComponent extends ActionSheetParent {
    constructor(domProvider) {
        super();
        this.domProvider = domProvider;
    }
    createInfoSheet(type, params) {
        return this.setupSheet(InfoSheetComponent, type, params)
            .instance;
    }
    setupSheet(componentType, sheetType, params) {
        const sheet = this.domProvider.appendComponentToBody(componentType);
        sheet.instance.componentRef = sheet;
        sheet.instance.sheetType = sheetType;
        sheet.instance.params = params;
        return sheet;
    }
};
NeedsBackupComponent = __decorate([
    Component({
        selector: 'needs-backup',
        templateUrl: 'needs-backup.html'
    }),
    __metadata("design:paramtypes", [DomProvider])
], NeedsBackupComponent);
export { NeedsBackupComponent };
//# sourceMappingURL=needs-backup.js.map