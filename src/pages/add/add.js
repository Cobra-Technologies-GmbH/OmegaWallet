import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// pages
import { AddWalletPage } from '../add-wallet/add-wallet';
import { ImportWalletPage } from '../add/import-wallet/import-wallet';
import { SelectCurrencyPage } from '../add/select-currency/select-currency';
// providers
import { Logger } from '../../providers';
let AddPage = class AddPage {
    constructor(navCtrl, logger, navParams) {
        this.navCtrl = navCtrl;
        this.logger = logger;
        this.navParams = navParams;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: AddPage');
        this.keyId = this.navParams.data.keyId;
        this.isZeroState = this.navParams.data.isZeroState;
    }
    goToAddWalletPage(isShared, isJoin) {
        if (this.navParams.data.isMultipleSeed) {
            this.navCtrl.push(AddWalletPage, {
                isCreate: true,
                isMultipleSeed: true,
                isShared,
                url: this.navParams.data.url
            });
        }
        else {
            this.navCtrl.push(SelectCurrencyPage, {
                isShared,
                isJoin,
                isZeroState: this.isZeroState && !isShared,
                keyId: this.keyId,
                url: this.navParams.data.url
            });
        }
    }
    goToImportWallet() {
        this.navCtrl.push(ImportWalletPage);
    }
    goBack() {
        this.navCtrl.pop();
    }
};
AddPage = __decorate([
    Component({
        selector: 'page-add',
        templateUrl: 'add.html'
    }),
    __metadata("design:paramtypes", [NavController,
        Logger,
        NavParams])
], AddPage);
export { AddPage };
//# sourceMappingURL=add.js.map