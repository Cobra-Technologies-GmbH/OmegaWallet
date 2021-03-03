import { __decorate, __metadata } from "tslib";
import { DecimalPipe } from '@angular/common';
import { Pipe } from '@angular/core';
let FormatCurrencyPipe = class FormatCurrencyPipe {
    constructor(decimalPipe) {
        this.decimalPipe = decimalPipe;
    }
    transform(amount, currencyCode, customPrecision) {
        const precision = customPrecision === 'minimal'
            ? getMinimalPrecision(amount, currencyCode)
            : typeof customPrecision === 'number'
                ? customPrecision
                : getPrecision(currencyCode);
        const numericValue = this.decimalPipe.transform(amount, getPrecisionString(precision));
        const symbolMap = {
            BRL: 'R$',
            CAD: 'C$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            JPY: '¥',
            PHP: '₱',
            USD: '$'
        };
        const symbol = symbolMap[currencyCode.toUpperCase()];
        const finalValue = symbol
            ? `${symbol}${numericValue}`
            : `${numericValue} ${currencyCode}`;
        return finalValue;
    }
};
FormatCurrencyPipe = __decorate([
    Pipe({
        name: 'formatCurrency'
    }),
    __metadata("design:paramtypes", [DecimalPipe])
], FormatCurrencyPipe);
export { FormatCurrencyPipe };
function getPrecision(currencyCode) {
    return currencyCode.toUpperCase() === 'JPY' ? 0 : 2;
}
function getMinimalPrecision(amount, currencyCode) {
    return Number.isInteger(amount) ? 0 : getPrecision(currencyCode);
}
function getPrecisionString(precision) {
    return `1.${precision}-${precision}`;
}
//# sourceMappingURL=format-currency.js.map