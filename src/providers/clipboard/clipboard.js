import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import * as _ from 'lodash';
// providers
import { ElectronProvider } from '../../providers/electron/electron';
import { Logger } from '../../providers/logger/logger';
import { PlatformProvider } from '../../providers/platform/platform';
import { IncomingDataProvider } from '../incoming-data/incoming-data';
const validDataByCoin = {
    paypro: ['InvoiceUri', 'PayPro', 'BitPayUri'],
    btc: ['BitcoinUri', 'BitcoinAddress'],
    bch: ['BitcoinCashUri', 'BitcoinCashAddress'],
    eth: ['EthereumUri', 'EthereumAddress'],
    xrp: ['RippleUri', 'RippleAddress']
};
let ClipboardProvider = class ClipboardProvider {
    constructor(platformProvider, logger, clipboard, electronProvider, incomingDataProvider) {
        this.platformProvider = platformProvider;
        this.logger = logger;
        this.clipboard = clipboard;
        this.electronProvider = electronProvider;
        this.incomingDataProvider = incomingDataProvider;
        this.logger.debug('ClipboardProvider initialized');
        this.isCordova = this.platformProvider.isCordova;
        this.isElectron = this.platformProvider.isElectron;
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isCordova) {
                return this.clipboard.paste();
            }
            else if (this.isElectron) {
                return this.electronProvider.readFromClipboard();
            }
            else {
                let text;
                try {
                    text = navigator.clipboard.readText();
                }
                catch (error) {
                    return Promise.reject('Not supported for this device');
                }
                return text;
            }
        });
    }
    copy(value) {
        if (this.isCordova) {
            this.clipboard.copy(value);
        }
        else if (this.isElectron) {
            this.electronProvider.writeToClipboard(value);
        }
        else {
            throw new Error('Copied to Clipboard using a Web Browser.');
        }
    }
    clear() {
        if (this.isCordova) {
            this.clipboard.copy(null);
        }
        else if (this.isElectron) {
            this.electronProvider.clearClipboard();
        }
    }
    clearClipboardIfValidData(typeArray) {
        this.getData()
            .then(data => {
            const validDataFromClipboard = this.incomingDataProvider.parseData(data);
            if (validDataFromClipboard &&
                typeArray.indexOf(validDataFromClipboard.type) != -1) {
                this.logger.info('Cleaning clipboard data: done');
                this.clear(); // clear clipboard data if exist
            }
        })
            .catch(err => {
            this.logger.debug('Cleaning clipboard data: ', err);
        });
    }
    getValidData(coin) {
        return new Promise(resolve => {
            this.getData()
                .then(data => {
                if (_.isEmpty(data))
                    return resolve();
                const dataFromClipboard = this.incomingDataProvider.parseData(data);
                if (!dataFromClipboard)
                    return resolve();
                // Check crypto/paypro uri
                if (validDataByCoin['paypro'].indexOf(dataFromClipboard.type) > -1 ||
                    validDataByCoin[coin].indexOf(dataFromClipboard.type) > -1) {
                    return resolve(dataFromClipboard.data);
                }
            })
                .catch(err => {
                this.logger.warn('Clipboard Warning: ', err);
                resolve();
            });
        });
    }
};
ClipboardProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PlatformProvider,
        Logger,
        Clipboard,
        ElectronProvider,
        IncomingDataProvider])
], ClipboardProvider);
export { ClipboardProvider };
//# sourceMappingURL=clipboard.js.map