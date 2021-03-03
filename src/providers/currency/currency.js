import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { availableCoins } from './coin';
import { TokenOpts } from './token';
export var Coin;
(function (Coin) {
    Coin["BTC"] = "btc";
    Coin["BCH"] = "bch";
    Coin["ETH"] = "eth";
    Coin["XRP"] = "xrp";
    Coin["USDC"] = "usdc";
    Coin["GUSD"] = "gusd";
    Coin["PAX"] = "pax";
    Coin["BUSD"] = "busd";
    Coin["DAI"] = "dai";
    Coin["WBTC"] = "wbtc";
    Coin["EUR"] = "eur";
})(Coin || (Coin = {}));
let CurrencyProvider = class CurrencyProvider {
    constructor() {
        this.ratesApi = {};
        this.blockExplorerUrls = {};
        this.blockExplorerUrlsTestnet = {};
        this.coinOpts = availableCoins;
        this.availableTokens = Object.values(TokenOpts);
        this.availableCoins = Object.keys(this.coinOpts);
        for (const opts of Object.values(this.coinOpts)) {
            const { paymentInfo, coin } = opts;
            const { blockExplorerUrls, blockExplorerUrlsTestnet, ratesApi } = paymentInfo;
            this.blockExplorerUrls[coin] = blockExplorerUrls;
            this.blockExplorerUrlsTestnet[coin] = blockExplorerUrlsTestnet;
            this.ratesApi[coin] = ratesApi;
        }
    }
    isUtxoCoin(coin) {
        return !!this.coinOpts[coin].properties.isUtxo;
    }
    isSingleAddress(coin) {
        return !!this.coinOpts[coin].properties.singleAddress;
    }
    isSharedCoin(coin) {
        return !!this.coinOpts[coin].properties.hasMultiSig;
    }
    isERCToken(coin) {
        return !!this.coinOpts[coin].properties.isERCToken;
    }
    getLinkedEthWallet(coin, walletId, m) {
        if (!this.coinOpts[coin].properties.isERCToken && coin !== 'eth')
            return null;
        if (coin === 'eth' && m === 1)
            return null;
        return walletId.replace(/-0x.*$/, '');
    }
    isMultiSend(coin) {
        return !!this.coinOpts[coin].properties.hasMultiSend;
    }
    getAvailableCoins() {
        return this.availableCoins;
    }
    getAvailableChains() {
        return _.uniq(_.map(Object.values(this.coinOpts), (opts) => opts.chain.toLowerCase()));
    }
    getAvailableTokens() {
        return this.availableTokens;
    }
    getMultiSigCoins() {
        return this.availableCoins.filter(coin => this.isSharedCoin(coin));
    }
    getCoinName(coin) {
        return this.coinOpts[coin].name;
    }
    getChain(coin) {
        return this.coinOpts[coin].chain;
    }
    getRatesApi() {
        return this.ratesApi;
    }
    getBlockExplorerUrls() {
        return this.blockExplorerUrls;
    }
    getBlockExplorerUrlsTestnet() {
        return this.blockExplorerUrlsTestnet;
    }
    getPaymentCode(coin) {
        return this.coinOpts[coin].paymentInfo.paymentCode;
    }
    getPrecision(coin) {
        return this.coinOpts[coin].unitInfo;
    }
    getProtocolPrefix(coin, network) {
        return this.coinOpts[coin].paymentInfo.protocolPrefix[network];
    }
    getFeeUnits(coin) {
        return this.coinOpts[coin].feeInfo;
    }
    getMaxMerchantFee(coin) {
        return this.coinOpts[coin].feeInfo.maxMerchantFee;
    }
    getTheme(coin) {
        return this.coinOpts[coin].theme;
    }
};
CurrencyProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], CurrencyProvider);
export { CurrencyProvider };
//# sourceMappingURL=currency.js.map