import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
import { InfoSheetTemplate } from './info-sheet-template';
let InfoSheetComponent = class InfoSheetComponent extends ActionSheetParent {
    constructor(externalLinkProvider) {
        super();
        this.externalLinkProvider = externalLinkProvider;
    }
    ngAfterViewInit() {
        this.infoSheetTemplate.onDismiss.subscribe(option => {
            this.dismiss(option);
        });
    }
    openInBrowser(url) {
        this.externalLinkProvider.open(url);
        this.dismiss();
    }
    optionClicked(option) {
        this.dismiss(option);
    }
};
__decorate([
    ViewChild(InfoSheetTemplate),
    __metadata("design:type", InfoSheetTemplate)
], InfoSheetComponent.prototype, "infoSheetTemplate", void 0);
InfoSheetComponent = __decorate([
    Component({
        selector: 'info-sheet',
        templateUrl: 'info-sheet.html'
    }),
    __metadata("design:paramtypes", [ExternalLinkProvider])
], InfoSheetComponent);
export { InfoSheetComponent };
export const INFO_SHEET_COMPONENTS = [InfoSheetComponent, InfoSheetTemplate];
//# sourceMappingURL=info-sheet.js.map