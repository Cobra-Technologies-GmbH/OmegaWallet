import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import BWC from 'bitcore-wallet-client';
let BwcProvider = class BwcProvider {
    constructor(logger) {
        this.logger = logger;
        this.parseSecret = BWC.parseSecret;
        this.Client = BWC;
        this.logger.debug('BwcProvider initialized');
    }
    getBitcore() {
        return BWC.Bitcore;
    }
    getBitcoreCash() {
        return BWC.BitcoreCash;
    }
    getCore() {
        return BWC.Core;
    }
    getErrors() {
        return BWC.errors;
    }
    getSJCL() {
        return BWC.sjcl;
    }
    getUtils() {
        return BWC.Utils;
    }
    getKey() {
        return BWC.Key;
    }
    getPayProV2() {
        return BWC.PayProV2;
    }
    upgradeCredentialsV1(x) {
        return BWC.upgradeCredentialsV1(x);
    }
    upgradeMultipleCredentialsV1(x) {
        return BWC.upgradeMultipleCredentialsV1(x);
    }
    getClient(walletData, opts) {
        opts = opts || {};
        // note opts use `bwsurl` all lowercase;
        let bwc = new BWC({
            baseUrl: opts.bwsurl || 'https://bws.omega.eco/bws/api',
            verbose: opts.verbose,
            timeout: 100000,
            transports: ['polling'],
            bp_partner: opts.bp_partner,
            bp_partner_version: opts.bp_partner_version
        });
        if (walletData)
            bwc.fromString(walletData);
        return bwc;
    }
};
BwcProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger])
], BwcProvider);
export { BwcProvider };
//# sourceMappingURL=bwc.js.map