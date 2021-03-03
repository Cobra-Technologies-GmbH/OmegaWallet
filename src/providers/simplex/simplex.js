import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import * as moment from 'moment';
// providers
import env from '../../environments';
import { AppProvider } from '../app/app';
import { ConfigProvider } from '../config/config';
import { CurrencyProvider } from '../currency/currency';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';
import { RateProvider } from '../rate/rate';
const PASSTHROUGH_URI_DEV = 'https://cmgustavo.github.io/website/simplex/';
const PASSTHROUGH_URI_PROD = 'https://bws.omega.eco/static/simplex/';
let SimplexProvider = class SimplexProvider {
    constructor(appProvider, configProvider, homeIntegrationsProvider, logger, persistenceProvider, platformProvider, translate, rateProvider, currencyProvider) {
        this.appProvider = appProvider;
        this.configProvider = configProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.platformProvider = platformProvider;
        this.translate = translate;
        this.rateProvider = rateProvider;
        this.currencyProvider = currencyProvider;
        this.logger.debug('Simplex Provider initialized');
        this.env = env.name == 'development' ? 'sandbox' : 'production';
        this.passthrough_uri =
            env.name == 'development' ? PASSTHROUGH_URI_DEV : PASSTHROUGH_URI_PROD;
        this.supportedFiatAltCurrencies = [
            'AED',
            'ARS',
            'AUD',
            'AZN',
            'BGN',
            'BRL',
            'CAD',
            'CHF',
            'CLP',
            'CNY',
            'COP',
            'CRC',
            'CZK',
            'DKK',
            'DOP',
            'EUR',
            'GBP',
            'GEL',
            'HKD',
            'HUF',
            'ILS',
            'INR',
            'JPY',
            'KRW',
            'KZT',
            'MAD',
            'MDL',
            'MXN',
            'MYR',
            'NAD',
            'NGN',
            'NOK',
            'NZD',
            'PEN',
            'PHP',
            'PLN',
            'QAR',
            'RON',
            'RUB',
            'SEK',
            'SGD',
            'TRY',
            'TWD',
            'UAH',
            'USD',
            'UYU',
            'UZS',
            'VND',
            'ZAR'
        ];
        this.supportedCoins = ['btc', 'bch', 'eth', 'pax', 'busd'];
        this.fiatAmountLimits = {
            min: 50,
            max: 20000
        };
    }
    getSupportedFiatAltCurrencies() {
        return this.supportedFiatAltCurrencies;
    }
    getQuote(wallet, data) {
        data.env = this.env;
        return wallet.simplexGetQuote(data);
    }
    paymentRequest(wallet, data) {
        data.env = this.env;
        return wallet.simplexPaymentRequest(data);
    }
    getCheckoutUrl() {
        return env.name == 'development'
            ? 'https://sandbox.test-simplexcc.com'
            : 'https://checkout.simplexcc.com';
    }
    getEvents(wallet) {
        let data = {};
        data.env = this.env;
        return wallet.simplexGetEvents(data);
    }
    register() {
        this.homeIntegrationsProvider.register({
            name: 'simplex',
            title: this.translate.instant('Buy Crypto'),
            icon: 'assets/img/simplex/icon-simplex.png',
            showIcon: true,
            logo: 'assets/img/simplex/logo-simplex-color.svg',
            logoWidth: '110',
            background: 'linear-gradient(to bottom,rgba(60, 63, 69, 1) 0,rgba(45, 47, 51, 1) 100%)',
            page: 'SimplexPage',
            show: !!this.configProvider.get().showIntegration['simplex'],
            type: 'exchange'
        });
    }
    saveSimplex(data, opts) {
        const env = this.env;
        return this.persistenceProvider.getSimplex(env).then(oldData => {
            if (_.isString(oldData)) {
                oldData = JSON.parse(oldData);
            }
            if (_.isString(data)) {
                data = JSON.parse(data);
            }
            let inv = oldData ? oldData : {};
            inv[data.payment_id] = data;
            if (opts && (opts.error || opts.status)) {
                inv[data.payment_id] = _.assign(inv[data.payment_id], opts);
            }
            if (opts && opts.remove) {
                delete inv[data.payment_id];
            }
            inv = JSON.stringify(inv);
            this.persistenceProvider.setSimplex(env, inv);
            return Promise.resolve();
        });
    }
    getSimplex() {
        const env = this.env;
        return this.persistenceProvider.getSimplex(env);
    }
    getFiatCurrencyLimits(fiatCurrency, coin) {
        this.fiatAmountLimits.min = this.calculateFiatRate(50, fiatCurrency, coin);
        this.fiatAmountLimits.max = this.calculateFiatRate(20000, fiatCurrency, coin);
        return this.fiatAmountLimits;
    }
    calculateFiatRate(amount, fiatCurrency, cryptoCurrency) {
        if (_.includes(['USD', 'EUR'], fiatCurrency)) {
            return amount;
        }
        const rateFromFiat = this.rateProvider.fromFiat(amount, 'USD', cryptoCurrency);
        return +this.rateProvider
            .toFiat(rateFromFiat, fiatCurrency, cryptoCurrency)
            .toFixed(2);
    }
    simplexPaymentRequest(wallet, address, quoteData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug('Simplex: creating payment request');
            const profile = yield this.persistenceProvider.getProfile();
            const createdOn = profile && profile.createdOn
                ? moment(profile.createdOn).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
                : moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            const userAgent = this.platformProvider.getUserAgent();
            const data = {
                account_details: {
                    app_version_id: this.appProvider.info.version,
                    app_install_date: createdOn,
                    app_end_user_id: wallet.id,
                    signup_login: {
                        user_agent: userAgent,
                        timestamp: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
                    }
                },
                transaction_details: {
                    payment_details: {
                        quote_id: quoteData.quoteId,
                        fiat_total_amount: {
                            currency: quoteData.currency,
                            amount: quoteData.fiatTotalAmount
                        },
                        requested_digital_amount: {
                            currency: wallet.coin.toUpperCase(),
                            amount: quoteData.cryptoAmount
                        },
                        destination_wallet: {
                            currency: wallet.coin.toUpperCase(),
                            address,
                            tag: ''
                        },
                        original_http_ref_url: 'https://' + this.passthrough_uri
                    }
                }
            };
            this.logger.debug(JSON.stringify(data));
            return this.paymentRequest(wallet, data);
        });
    }
    getPaymentUrl(wallet, quoteData, remoteData) {
        const dataSrc = {
            version: '1',
            partner: remoteData.app_provider_id,
            payment_flow_type: 'wallet',
            return_url_success: this.passthrough_uri +
                'end.html?success=true&paymentId=' +
                remoteData.payment_id +
                '&quoteId=' +
                quoteData.quoteId +
                '&userId=' +
                wallet.id +
                '&returnApp=' +
                this.appProvider.info.name,
            return_url_fail: this.passthrough_uri +
                'end.html?success=false&paymentId=' +
                remoteData.payment_id +
                '&quoteId=' +
                quoteData.quoteId +
                '&userId=' +
                wallet.id +
                '&returnApp=' +
                this.appProvider.info.name,
            quote_id: quoteData.quoteId,
            payment_id: remoteData.payment_id,
            user_id: wallet.id,
            'destination_wallet[address]': remoteData.address,
            'destination_wallet[currency]': this.currencyProvider.getChain(wallet.coin),
            'fiat_total_amount[amount]': quoteData.fiatTotalAmount,
            'fiat_total_amount[currency]': quoteData.currency,
            'digital_total_amount[amount]': quoteData.cryptoAmount,
            'digital_total_amount[currency]': this.currencyProvider.getChain(wallet.coin)
        };
        let str = '';
        for (let key in dataSrc) {
            if (str != '') {
                str += '&';
            }
            str += key + '=' + encodeURIComponent(dataSrc[key]);
        }
        const api_host = this.getCheckoutUrl();
        const url = this.passthrough_uri + '?api_host=' + api_host + '/payments/new/&' + str;
        this.logger.debug('Simplex: ready for payment form submission');
        return url;
    }
};
SimplexProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AppProvider,
        ConfigProvider,
        HomeIntegrationsProvider,
        Logger,
        PersistenceProvider,
        PlatformProvider,
        TranslateService,
        RateProvider,
        CurrencyProvider])
], SimplexProvider);
export { SimplexProvider };
//# sourceMappingURL=simplex.js.map