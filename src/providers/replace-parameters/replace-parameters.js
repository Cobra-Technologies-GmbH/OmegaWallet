/*
 * Example of use:
 * let message = this.replaceParametersProvider.replace(this.translate.instant('A total of {{amountBelowFeeStr}} {{coin}} were excluded. These funds come from UTXOs smaller than the network fee provided.'), { amountBelowFeeStr: amountBelowFeeStr, coin: this.tx.coin.toUpperCase() });
 */
import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
let ReplaceParametersProvider = class ReplaceParametersProvider {
    constructor() { }
    replace(stringToReplace, params) {
        let processedParams = [];
        for (let key in params) {
            processedParams.push({ key, value: params[key] });
        }
        processedParams.forEach(param => {
            stringToReplace = _.replace(stringToReplace, new RegExp('{{' + param.key + '}}', 'g'), param.value);
            stringToReplace = _.replace(stringToReplace, new RegExp('{{ ' + param.key + ' }}', 'g'), param.value);
        });
        return stringToReplace;
    }
};
ReplaceParametersProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], ReplaceParametersProvider);
export { ReplaceParametersProvider };
//# sourceMappingURL=replace-parameters.js.map