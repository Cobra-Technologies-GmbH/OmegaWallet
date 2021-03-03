import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import { AppleWalletNg } from 'apple-wallet-ng';
let AppleWalletProvider = class AppleWalletProvider {
    constructor(logger, appleWallet) {
        this.logger = logger;
        this.appleWallet = appleWallet;
        this.logger.debug('AppleWalletProvider initialized');
    }
    available() {
        return this.appleWallet.available();
    }
    startAddPaymentPass(params) {
        return this.appleWallet.startAddPaymentPass(params);
    }
    completeAddPaymentPass(params) {
        return this.appleWallet.completeAddPaymentPass(params);
    }
    checkPairedDevicesBySuffix(cardSuffix) {
        return this.appleWallet.checkPairedDevicesBySuffix(cardSuffix);
    }
    graphRequest(headers, json) {
        return this.appleWallet.graphRequest(headers, json);
    }
};
AppleWalletProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger, AppleWalletNg])
], AppleWalletProvider);
export { AppleWalletProvider };
//# sourceMappingURL=apple-wallet.js.map