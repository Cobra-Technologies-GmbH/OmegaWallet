import { __decorate, __metadata } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
// Providers
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { AddressProvider } from '../../../providers/address/address';
import { Logger } from '../../../providers/logger/logger';
import { WalletProvider } from '../../../providers/wallet/wallet';
let MultipleOutputsPage = class MultipleOutputsPage {
    constructor(addressBookProvider, addressProvider, logger, translate, walletProvider) {
        this.addressBookProvider = addressBookProvider;
        this.addressProvider = addressProvider;
        this.logger = logger;
        this.translate = translate;
        this.walletProvider = walletProvider;
        this.openBlockChainEvent = new EventEmitter();
        this.showMultiplesOutputs = false;
    }
    set tx(tx) {
        this._tx = tx;
        this._misunderstoodOutputsMsg = tx.misunderstoodOutputs
            ? this.translate.instant('There are some misunderstood outputs, please view on blockchain.')
            : undefined;
        this.tx.outputs.forEach(output => {
            const outputAddr = output.toAddress ? output.toAddress : output.address;
            this.coin = this._tx.coin
                ? this._tx.coin
                : this.addressProvider.getCoinAndNetwork(outputAddr, this._tx.network)
                    .coin;
            const addressToShow = this.walletProvider.getAddressView(this.coin, this._tx.network, outputAddr);
            output.addressToShow =
                addressToShow == 'false' ? 'Unparsed address' : addressToShow;
        });
        this.contact();
    }
    get tx() {
        return this._tx;
    }
    get misunderstoodOutputsMsg() {
        return this._misunderstoodOutputsMsg;
    }
    viewOnBlockchain() {
        this.openBlockChainEvent.next();
    }
    contact() {
        const addr = this._tx.toAddress;
        this.addressBookProvider
            .get(addr)
            .then(ab => {
            if (ab) {
                const name = _.isObject(ab) ? ab.name : ab;
                this.contactName = name;
            }
        })
            .catch(err => {
            this.logger.warn(err);
        });
    }
};
__decorate([
    Output(),
    __metadata("design:type", Object)
], MultipleOutputsPage.prototype, "openBlockChainEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], MultipleOutputsPage.prototype, "tx", null);
MultipleOutputsPage = __decorate([
    Component({
        selector: 'page-multiple-outputs',
        templateUrl: 'multiple-outputs.html'
    }),
    __metadata("design:paramtypes", [AddressBookProvider,
        AddressProvider,
        Logger,
        TranslateService,
        WalletProvider])
], MultipleOutputsPage);
export { MultipleOutputsPage };
//# sourceMappingURL=multiple-outputs.js.map