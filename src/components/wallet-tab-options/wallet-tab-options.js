import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let WalletTabOptionsComponent = class WalletTabOptionsComponent extends ActionSheetParent {
    constructor() {
        super();
    }
    ngOnInit() {
        this.walletsGroups = this.params.walletsGroups;
    }
};
WalletTabOptionsComponent = __decorate([
    Component({
        selector: 'wallet-tab-options-component',
        templateUrl: 'wallet-tab-options.html'
    }),
    __metadata("design:paramtypes", [])
], WalletTabOptionsComponent);
export { WalletTabOptionsComponent };
//# sourceMappingURL=wallet-tab-options.js.map