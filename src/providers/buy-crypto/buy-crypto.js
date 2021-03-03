import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
// providers
import { ConfigProvider } from '../config/config';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { Logger } from '../logger/logger';
import { PlatformProvider } from '../platform/platform';
import { SimplexProvider } from '../simplex/simplex';
import { WyreProvider } from '../wyre/wyre';
let BuyCryptoProvider = class BuyCryptoProvider {
    constructor(configProvider, homeIntegrationsProvider, logger, translate, simplexProvider, wyreProvider, platformProvider) {
        this.configProvider = configProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.logger = logger;
        this.translate = translate;
        this.simplexProvider = simplexProvider;
        this.wyreProvider = wyreProvider;
        this.platformProvider = platformProvider;
        this.logger.debug('BuyCrypto Provider initialized');
        this.exchangeCoinsSupported = _.union(this.simplexProvider.supportedCoins, this.wyreProvider.supportedCoins);
        this.paymentMethodsAvailable = {
            applePay: {
                label: this.translate.instant('Apple Pay'),
                method: 'applePay',
                imgSrc: 'assets/img/buy-crypto/apple-pay-logo.svg',
                supportedExchanges: {
                    simplex: false,
                    wyre: true
                },
                enabled: this.platformProvider.isIOS
            },
            sepaBankTransfer: {
                label: this.translate.instant('SEPA Bank Transfer'),
                method: 'sepaBankTransfer',
                imgSrc: 'assets/img/buy-crypto/icon-bank.svg',
                supportedExchanges: {
                    simplex: true,
                    wyre: false
                },
                enabled: true
            },
            creditCard: {
                label: this.translate.instant('Credit Card'),
                method: 'creditCard',
                imgSrc: 'assets/img/buy-crypto/icon-creditcard.svg',
                supportedExchanges: {
                    simplex: true,
                    wyre: false
                },
                enabled: true
            },
            debitCard: {
                label: this.translate.instant('Debit Card'),
                method: 'debitCard',
                imgSrc: 'assets/img/buy-crypto/icon-debitcard.svg',
                supportedExchanges: {
                    simplex: true,
                    wyre: true
                },
                enabled: true
            }
        };
    }
    register() {
        this.homeIntegrationsProvider.register({
            name: 'buycrypto',
            title: this.translate.instant('Buy Crypto'),
            icon: 'assets/img/icon-coins.svg',
            showIcon: true,
            logo: null,
            logoWidth: '110',
            background: 'linear-gradient(to bottom,rgba(60, 63, 69, 1) 0,rgba(45, 47, 51, 1) 100%)',
            page: 'CryptoSettingsPage',
            show: !!this.configProvider.get().showIntegration['buycrypto'],
            type: 'exchange'
        });
    }
    isCurrencySupported(exchange, currency) {
        switch (exchange) {
            case 'simplex':
                return _.includes(this.simplexProvider.supportedFiatAltCurrencies, currency.toUpperCase());
            case 'wyre':
                return _.includes(this.wyreProvider.supportedFiatAltCurrencies, currency.toUpperCase());
            default:
                return false;
        }
    }
    isCoinSupported(exchange, coin) {
        switch (exchange) {
            case 'simplex':
                return _.includes(this.simplexProvider.supportedCoins, coin);
            case 'wyre':
                return _.includes(this.wyreProvider.supportedCoins, coin);
            default:
                return false;
        }
    }
    isPaymentMethodSupported(exchange, paymentMethod, coin, currency) {
        return (paymentMethod.supportedExchanges[exchange] &&
            this.isCoinSupported(exchange, coin) &&
            this.isCurrencySupported(exchange, currency));
    }
    getPaymentRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            const [simplexPaymentRequests, wyrePaymentRequests] = yield Promise.all([
                this.simplexProvider.getSimplex(),
                this.wyreProvider.getWyre()
            ]);
            return {
                simplexPaymentRequests: _.values(simplexPaymentRequests),
                wyrePaymentRequests: _.values(wyrePaymentRequests)
            };
        });
    }
};
BuyCryptoProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigProvider,
        HomeIntegrationsProvider,
        Logger,
        TranslateService,
        SimplexProvider,
        WyreProvider,
        PlatformProvider])
], BuyCryptoProvider);
export { BuyCryptoProvider };
//# sourceMappingURL=buy-crypto.js.map