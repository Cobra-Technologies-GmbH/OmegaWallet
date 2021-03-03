import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
import { StatusBar } from '@ionic-native/status-bar';
import { PlatformProvider } from '../../providers/platform/platform';
let OptionsSheetComponent = class OptionsSheetComponent extends ActionSheetParent {
    constructor(platformProvider, statusBar) {
        super();
        this.platformProvider = platformProvider;
        this.statusBar = statusBar;
    }
    ngOnInit() {
        if (this.platformProvider.isIOS) {
            this.statusBar.hide();
        }
    }
    ngOnDestroy() {
        if (this.platformProvider.isIOS) {
            this.statusBar.show();
        }
    }
    optionClicked(option) {
        this.dismiss(option);
    }
};
OptionsSheetComponent = __decorate([
    Component({
        selector: 'options-sheet',
        templateUrl: 'options-sheet.html'
    }),
    __metadata("design:paramtypes", [PlatformProvider,
        StatusBar])
], OptionsSheetComponent);
export { OptionsSheetComponent };
//# sourceMappingURL=options-sheet.js.map