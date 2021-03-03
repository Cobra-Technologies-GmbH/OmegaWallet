import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
let BalanceToShowComponent = class BalanceToShowComponent {
    constructor() {
        this.resize = false;
    }
    set balance(value) {
        this._balance = value;
        this.processBalance(this._balance);
    }
    get balance() {
        return this._balance;
    }
    processBalance(balance) {
        if (!balance || balance === '')
            return;
        this.resize = Boolean(balance.length >= 18);
        if (balance.indexOf(' ') >= 0) {
            const spacePosition = balance.indexOf(' ');
            this.amount = balance.substr(0, spacePosition);
            this.unit = balance.substr(spacePosition, balance.length);
        }
    }
};
__decorate([
    Input(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [String])
], BalanceToShowComponent.prototype, "balance", null);
BalanceToShowComponent = __decorate([
    Component({
        selector: 'balance-to-show',
        templateUrl: 'balance-to-show.html'
    }),
    __metadata("design:paramtypes", [])
], BalanceToShowComponent);
export { BalanceToShowComponent };
//# sourceMappingURL=balance-to-show.js.map