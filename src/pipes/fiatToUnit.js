import { __decorate, __metadata } from "tslib";
import { Pipe } from '@angular/core';
import { ConfigProvider } from '../providers/config/config';
import { RateProvider } from '../providers/rate/rate';
import { TxFormatProvider } from '../providers/tx-format/tx-format';
let FiatToUnitPipe = class FiatToUnitPipe {
    constructor(configProvider, rateProvider, txFormatProvider) {
        this.configProvider = configProvider;
        this.rateProvider = rateProvider;
        this.txFormatProvider = txFormatProvider;
        this.walletSettings = this.configProvider.get().wallet.settings;
    }
    transform(amount, coin, alternative) {
        alternative = alternative
            ? alternative
            : this.walletSettings.alternativeIsoCode;
        let amount_ = this.rateProvider.fromFiat(amount, alternative, coin);
        return this.txFormatProvider.formatAmountStr(coin, amount_, true);
    }
};
FiatToUnitPipe = __decorate([
    Pipe({
        name: 'fiatToUnit',
        pure: false
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        RateProvider,
        TxFormatProvider])
], FiatToUnitPipe);
export { FiatToUnitPipe };
//# sourceMappingURL=fiatToUnit.js.map