import { __decorate, __metadata } from "tslib";
import { DecimalPipe } from '@angular/common';
import { Pipe } from '@angular/core';
import { ConfigProvider } from '../providers/config/config';
import { RateProvider } from '../providers/rate/rate';
let SatToFiatPipe = class SatToFiatPipe {
    constructor(configProvider, rateProvider, decimalPipe) {
        this.configProvider = configProvider;
        this.rateProvider = rateProvider;
        this.decimalPipe = decimalPipe;
        this.walletSettings = this.configProvider.get().wallet.settings;
    }
    transform(amount, coin) {
        let amount_ = this.rateProvider.toFiat(amount, this.walletSettings.alternativeIsoCode, coin.toLowerCase());
        return (this.decimalPipe.transform(amount_ || 0, '1.2-2') +
            ' ' +
            this.walletSettings.alternativeIsoCode);
    }
};
SatToFiatPipe = __decorate([
    Pipe({
        name: 'satToFiat',
        pure: false
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        RateProvider,
        DecimalPipe])
], SatToFiatPipe);
export { SatToFiatPipe };
//# sourceMappingURL=satToFiat.js.map