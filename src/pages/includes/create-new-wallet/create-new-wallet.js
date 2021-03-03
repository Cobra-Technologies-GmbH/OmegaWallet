import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// Pages
import { SelectCurrencyPage } from '../../add/select-currency/select-currency';
let CreateNewWalletPage = class CreateNewWalletPage {
    constructor(navCtrl) {
        this.navCtrl = navCtrl;
    }
    goToAddWalletPage() {
        this.navCtrl.push(SelectCurrencyPage, {
            isZeroState: true
        });
    }
};
CreateNewWalletPage = __decorate([
    Component({
        selector: 'create-new-wallet',
        templateUrl: 'create-new-wallet.html'
    }),
    __metadata("design:paramtypes", [NavController])
], CreateNewWalletPage);
export { CreateNewWalletPage };
//# sourceMappingURL=create-new-wallet.js.map