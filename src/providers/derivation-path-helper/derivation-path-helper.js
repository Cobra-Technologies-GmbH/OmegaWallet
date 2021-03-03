import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
let DerivationPathHelperProvider = class DerivationPathHelperProvider {
    constructor() {
        this.defaultBTC = "m/44'/0'/0'";
        this.defaultBCH = "m/44'/145'/0'";
        this.defaultETH = "m/44'/60'/0'";
        this.defaultXRP = "m/44'/144'/0'";
        this.defaultMultisigBTC = "m/48'/0'/0'";
        this.defaultMultisigBCH = "m/48'/145'/0'";
        this.defaultTestnet = "m/44'/1'/0'";
    }
    parsePath(path) {
        return {
            purpose: path.split('/')[1],
            coinCode: path.split('/')[2],
            account: path.split('/')[3]
        };
    }
    getDerivationStrategy(path) {
        const purpose = this.parsePath(path).purpose;
        let derivationStrategy;
        switch (purpose) {
            case "44'":
                derivationStrategy = 'BIP44';
                break;
            case "45'":
                derivationStrategy = 'BIP45';
                break;
            case "48'":
                derivationStrategy = 'BIP48';
                break;
        }
        return derivationStrategy;
    }
    getNetworkName(path) {
        // BIP45
        const purpose = this.parsePath(path).purpose;
        if (purpose == "45'")
            return 'livenet';
        const coinCode = this.parsePath(path).coinCode;
        let networkName;
        switch (coinCode) {
            case "0'": // for BTC
                networkName = 'livenet';
                break;
            case "1'": // testnet for all coins
                networkName = 'testnet';
                break;
            case "145'": // for BCH
                networkName = 'livenet';
                break;
            case "60'": // for ETH
                networkName = 'livenet';
                break;
            case "144'": // for XRP
                networkName = 'livenet';
                break;
        }
        return networkName;
    }
    getAccount(path) {
        // BIP45
        const purpose = this.parsePath(path).purpose;
        if (purpose == "45'")
            return 0;
        const account = this.parsePath(path).account || '';
        const match = account.match(/(\d+)'/);
        if (!match)
            return undefined;
        return +match[1];
    }
    isValidDerivationPathCoin(path, coin) {
        let isValid;
        const coinCode = this.parsePath(path).coinCode;
        // BIP45
        if (path == "m/45'")
            return true;
        switch (coin) {
            case 'btc':
                isValid = ["0'", "1'"].indexOf(coinCode) > -1;
                break;
            case 'bch':
                isValid = ["145'", "0'", "1'"].indexOf(coinCode) > -1;
                break;
            case 'eth':
                isValid = ["60'", "0'", "1'"].indexOf(coinCode) > -1;
                break;
            case 'xrp':
                isValid = ["144'", "0'", "1'"].indexOf(coinCode) > -1;
                break;
        }
        return isValid;
    }
};
DerivationPathHelperProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], DerivationPathHelperProvider);
export { DerivationPathHelperProvider };
//# sourceMappingURL=derivation-path-helper.js.map