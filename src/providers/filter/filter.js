import { __decorate, __metadata } from "tslib";
import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
let FilterProvider = class FilterProvider {
    constructor(decimalPipe, logger) {
        this.decimalPipe = decimalPipe;
        this.logger = logger;
        this.logger.debug('FilterProvider initialized');
        this.formats = {
            CURRENCY_SYM: '$',
            DECIMAL_SEP: '.',
            GROUP_SEP: ','
        };
    }
    formatFiatAmount(amount) {
        let value;
        let sep;
        let group;
        let intValue;
        let floatValue;
        let finalValue;
        value = this.decimalPipe.transform(amount);
        if (!value)
            return 0;
        sep = value.indexOf(this.formats.DECIMAL_SEP);
        group = value.indexOf(this.formats.GROUP_SEP);
        if (amount >= 0) {
            if (group > 0) {
                if (sep < 0) {
                    return value;
                }
                intValue = value.substring(0, sep);
                floatValue = parseFloat(value.substring(sep));
                floatValue = floatValue.toFixed(2);
                floatValue = floatValue.toString().substring(1);
                finalValue = intValue + floatValue;
                return finalValue;
            }
            else {
                value = parseFloat(value);
                return value.toFixed(2);
            }
        }
        return 0;
    }
};
FilterProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DecimalPipe, Logger])
], FilterProvider);
export { FilterProvider };
//# sourceMappingURL=filter.js.map