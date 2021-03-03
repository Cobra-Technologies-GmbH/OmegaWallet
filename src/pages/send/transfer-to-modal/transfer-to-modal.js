import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
let TransferToModalPage = class TransferToModalPage {
    constructor(navParams) {
        this.navParams = navParams;
        this.search = '';
        this.wallet = this.navParams.data.wallet;
        this.fromSelectInputs = this.navParams.data.fromSelectInputs;
        this.fromMultiSend = this.navParams.data.fromMultiSend;
    }
};
TransferToModalPage = __decorate([
    Component({
        selector: 'page-transfer-to-modal',
        templateUrl: 'transfer-to-modal.html'
    }),
    __metadata("design:paramtypes", [NavParams])
], TransferToModalPage);
export { TransferToModalPage };
//# sourceMappingURL=transfer-to-modal.js.map