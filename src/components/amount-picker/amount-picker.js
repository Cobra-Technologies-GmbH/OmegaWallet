import { __decorate, __metadata } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
let AmountPickerComponent = class AmountPickerComponent {
    constructor() {
        this.amountChange = new EventEmitter();
    }
    ngOnInit() {
        this.amountIndex = getMiddleIndex(this.supportedAmounts);
        this.getAmount() && this.amountChange.emit(this.getAmount());
    }
    getAmount() {
        return ((this.supportedAmounts && this.supportedAmounts[this.amountIndex]) || 0);
    }
    shouldShowButton(value) {
        return (this.supportedAmounts && this.supportedAmounts[this.amountIndex + value]);
    }
    changeAmount(indexValue) {
        this.amountIndex = this.amountIndex + indexValue;
        this.amountChange.emit(this.getAmount());
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], AmountPickerComponent.prototype, "currency", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AmountPickerComponent.prototype, "supportedAmounts", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], AmountPickerComponent.prototype, "amountChange", void 0);
AmountPickerComponent = __decorate([
    Component({
        selector: 'amount-picker',
        templateUrl: 'amount-picker.html'
    })
], AmountPickerComponent);
export { AmountPickerComponent };
function getMiddleIndex(arr) {
    return arr && Math.floor(arr.length / 2);
}
//# sourceMappingURL=amount-picker.js.map