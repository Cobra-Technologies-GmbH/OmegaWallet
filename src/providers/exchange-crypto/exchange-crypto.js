import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
// providers
import { ChangellyProvider } from '../changelly/changelly';
import { ConfigProvider } from '../config/config';
import { CurrencyProvider } from '../currency/currency';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { Logger } from '../logger/logger';
import { ReplaceParametersProvider } from '../replace-parameters/replace-parameters';
let ExchangeCryptoProvider = class ExchangeCryptoProvider {
    constructor(changellyProvider, configProvider, currencyProvider, homeIntegrationsProvider, logger, replaceParametersProvider, translate) {
        this.changellyProvider = changellyProvider;
        this.configProvider = configProvider;
        this.currencyProvider = currencyProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.logger = logger;
        this.replaceParametersProvider = replaceParametersProvider;
        this.translate = translate;
        this.logger.debug('ExchangeCrypto Provider initialized');
        this.exchangeCoinsSupported = _.union(this.changellyProvider.supportedCoins);
    }
    register() {
        this.homeIntegrationsProvider.register({
            name: 'exchangecrypto',
            title: this.translate.instant('Exchange Crypto'),
            icon: 'assets/img/exchange-crypto/exchange-settings.svg',
            showIcon: true,
            logo: null,
            logoWidth: '110',
            background: 'linear-gradient(to bottom,rgba(60, 63, 69, 1) 0,rgba(45, 47, 51, 1) 100%)',
            page: 'CryptoSettingsPage',
            show: !!this.configProvider.get().showIntegration['exchangecrypto'],
            type: 'exchange'
        });
    }
    getSwapTxs() {
        return __awaiter(this, void 0, void 0, function* () {
            const [changellySwapTxs] = yield Promise.all([
                this.changellyProvider.getChangelly()
            ]);
            return {
                changellySwapTxs: _.values(changellySwapTxs)
            };
        });
    }
    verifyExcludedUtxos(coin, sendMaxInfo) {
        const warningMsg = [];
        if (sendMaxInfo.utxosBelowFee > 0) {
            const amountBelowFeeStr = sendMaxInfo.amountBelowFee /
                this.currencyProvider.getPrecision(coin).unitToSatoshi;
            const message = this.replaceParametersProvider.replace(this.translate.instant('A total of {{amountBelowFeeStr}} {{coin}} were excluded. These funds come from UTXOs smaller than the network fee provided.'), { amountBelowFeeStr, coin: coin.toUpperCase() });
            warningMsg.push(message);
        }
        if (sendMaxInfo.utxosAboveMaxSize > 0) {
            const amountAboveMaxSizeStr = sendMaxInfo.amountAboveMaxSize /
                this.currencyProvider.getPrecision(coin).unitToSatoshi;
            const message = this.replaceParametersProvider.replace(this.translate.instant('A total of {{amountAboveMaxSizeStr}} {{coin}} were excluded. The maximum size allowed for a transaction was exceeded.'), { amountAboveMaxSizeStr, coin: coin.toUpperCase() });
            warningMsg.push(message);
        }
        return warningMsg.join('\n');
    }
};
ExchangeCryptoProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ChangellyProvider,
        ConfigProvider,
        CurrencyProvider,
        HomeIntegrationsProvider,
        Logger,
        ReplaceParametersProvider,
        TranslateService])
], ExchangeCryptoProvider);
export { ExchangeCryptoProvider };
//# sourceMappingURL=exchange-crypto.js.map