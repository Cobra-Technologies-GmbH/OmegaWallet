import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Logger } from '../../../providers/logger/logger';
// Providers
import { ConfigProvider } from '../../../providers/config/config';
import { FeeProvider } from '../../../providers/fee/fee';
const COIN = 'btc';
const NETWORK = 'livenet';
let FeePolicyPage = class FeePolicyPage {
    constructor(logger, feeProvider, configProvider) {
        this.logger = logger;
        this.feeProvider = feeProvider;
        this.configProvider = configProvider;
        this.feeOpts = this.feeProvider.getFeeOpts();
        delete this.feeOpts['custom']; // Remove custom level
        this.currentFeeLevel = this.feeProvider.getCurrentFeeLevel();
    }
    ionViewDidEnter() {
        this.error = null;
        return this.feeProvider
            .getFeeLevels(COIN)
            .then(data => {
            this.feeLevels = data['levels'];
            this.updateCurrentValues();
        })
            .catch(err => {
            this.logger.error(err);
            this.error = err;
        });
    }
    save() {
        if (_.isEmpty(this.currentFeeLevel) ||
            this.currentFeeLevel == this.feeProvider.getCurrentFeeLevel())
            return;
        this.logger.debug('New fee level: ' + this.currentFeeLevel);
        this.updateCurrentValues();
        this.setFee();
    }
    updateCurrentValues() {
        if (_.isEmpty(this.feeLevels) || _.isEmpty(this.currentFeeLevel))
            return;
        let value = _.find(this.feeLevels[NETWORK], {
            level: this.currentFeeLevel
        });
        if (_.isEmpty(value))
            return;
        this.feePerSatByte = (value['feePerKb'] / 1000).toFixed();
        this.avgConfirmationTime = value['nbBlocks'] * 10;
    }
    setFee() {
        let opts = {
            wallet: {
                settings: {
                    feeLevel: this.currentFeeLevel
                }
            }
        };
        this.configProvider.set(opts);
    }
};
FeePolicyPage = __decorate([
    Component({
        selector: 'page-fee-policy',
        templateUrl: 'fee-policy.html'
    }),
    __metadata("design:paramtypes", [Logger,
        FeeProvider,
        ConfigProvider])
], FeePolicyPage);
export { FeePolicyPage };
//# sourceMappingURL=fee-policy.js.map