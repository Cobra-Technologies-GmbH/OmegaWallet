import { __decorate, __metadata } from "tslib";
import { Pipe } from '@angular/core';
import { TxFormatProvider } from '../providers/tx-format/tx-format';
let SatToUnitPipe = class SatToUnitPipe {
    constructor(txFormatProvider) {
        this.txFormatProvider = txFormatProvider;
    }
    transform(amount, coin) {
        return this.txFormatProvider.formatAmountStr(coin, amount);
    }
};
SatToUnitPipe = __decorate([
    Pipe({
        name: 'satToUnit',
        pure: false
    }),
    __metadata("design:paramtypes", [TxFormatProvider])
], SatToUnitPipe);
export { SatToUnitPipe };
//# sourceMappingURL=satToUnit.js.map