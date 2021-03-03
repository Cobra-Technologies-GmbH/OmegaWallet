import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import * as _ from 'lodash';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let WalletSelectorComponent = class WalletSelectorComponent extends ActionSheetParent {
    constructor() {
        super();
    }
    ngOnInit() {
        this.title = this.params.title;
        this.selectedWalletId = this.params.selectedWalletId;
        this.coinbaseData = this.params.coinbaseData;
        this.separateWallets();
    }
    separateWallets() {
        const wallets = this.params.wallets;
        this.walletsByKeys = _.values(_.groupBy(wallets, 'keyId'));
    }
    optionClicked(option, isCoinbaseAccount) {
        if (!isCoinbaseAccount)
            this.dismiss(option);
        else {
            const optionClicked = {
                accountSelected: _.find(this.coinbaseData.availableAccounts, ac => ac.id == option),
                isCoinbaseAccount
            };
            this.dismiss(optionClicked);
        }
    }
};
WalletSelectorComponent = __decorate([
    Component({
        selector: 'wallet-selector',
        templateUrl: 'wallet-selector.html'
    }),
    __metadata("design:paramtypes", [])
], WalletSelectorComponent);
export { WalletSelectorComponent };
//# sourceMappingURL=wallet-selector.js.map