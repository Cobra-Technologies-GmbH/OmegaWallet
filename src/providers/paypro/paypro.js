import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// providers
import { BwcProvider } from '../bwc/bwc';
import { CurrencyProvider } from '../currency/currency';
import { OnGoingProcessProvider } from '../on-going-process/on-going-process';
let PayproProvider = class PayproProvider {
    constructor(logger, bwcProvider, currencyProvider, onGoingProcessProvider) {
        this.logger = logger;
        this.bwcProvider = bwcProvider;
        this.currencyProvider = currencyProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.logger.debug('PayproProvider initialized');
    }
    getPayProOptions(paymentUrl, disableLoader, attempt = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('PayPro Options: try... ' + attempt);
            const bwc = this.bwcProvider.getPayProV2();
            const options = {
                paymentUrl
            };
            if (!disableLoader) {
                this.onGoingProcessProvider.set('fetchingPayProOptions');
            }
            const payOpts = yield bwc.getPaymentOptions(options).catch((err) => __awaiter(this, void 0, void 0, function* () {
                this.logger.error(`PayPro Options ERR: ${err.message}`);
                if (attempt <= 3) {
                    yield new Promise(resolve => setTimeout(resolve, 5000 * attempt));
                    return this.getPayProOptions(paymentUrl, disableLoader, ++attempt);
                }
                else {
                    if (!disableLoader)
                        this.onGoingProcessProvider.clear();
                    throw err;
                }
            }));
            if (!disableLoader)
                this.onGoingProcessProvider.clear();
            this.logger.info('PayPro Options: SUCCESS');
            return payOpts;
        });
    }
    getPayProDetails(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let { paymentUrl, coin, payload, disableLoader, attempt = 1 } = params;
            this.logger.info('PayPro Details: try... ' + attempt);
            const bwc = this.bwcProvider.getPayProV2();
            const chain = this.currencyProvider.getChain(coin).toUpperCase();
            const options = {
                paymentUrl,
                chain,
                currency: coin.toUpperCase(),
                payload
            };
            if (!disableLoader) {
                this.onGoingProcessProvider.set('fetchingPayPro');
            }
            const payDetails = yield bwc
                .selectPaymentOption(options)
                .catch((err) => __awaiter(this, void 0, void 0, function* () {
                this.logger.error(`PayPro Details ERR: ${err.message}`);
                if (attempt <= 3) {
                    yield new Promise(resolve => setTimeout(resolve, 5000 * attempt));
                    return this.getPayProDetails({
                        paymentUrl,
                        coin,
                        payload,
                        disableLoader,
                        attempt: ++attempt
                    });
                }
                else {
                    if (!disableLoader)
                        this.onGoingProcessProvider.clear();
                    throw err;
                }
            }));
            if (!disableLoader)
                this.onGoingProcessProvider.clear();
            this.logger.info('PayPro Details: SUCCESS');
            return payDetails;
        });
    }
};
PayproProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        BwcProvider,
        CurrencyProvider,
        OnGoingProcessProvider])
], PayproProvider);
export { PayproProvider };
//# sourceMappingURL=paypro.js.map