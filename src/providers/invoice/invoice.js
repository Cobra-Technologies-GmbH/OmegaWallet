import { __awaiter, __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmailNotificationsProvider } from '../email-notifications/email-notifications';
import { Logger } from '../logger/logger';
import { Network, PersistenceProvider } from '../persistence/persistence';
let InvoiceProvider = class InvoiceProvider {
    constructor(emailNotificationsProvider, http, logger, persistenceProvider) {
        this.emailNotificationsProvider = emailNotificationsProvider;
        this.http = http;
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.credentials = {
            NETWORK: Network.livenet,
            BITPAY_API_URL: 'https://bitpay.com'
        };
        this.logger.debug('InvoiceProvider initialized');
    }
    setNetwork(network) {
        this.credentials.NETWORK = Network[network];
        this.credentials.BITPAY_API_URL =
            network === Network.livenet
                ? 'https://bitpay.com'
                : 'https://test.bitpay.com';
        this.logger.log(`invoice provider initialized with ${network}`);
    }
    getNetwork() {
        return this.credentials.NETWORK;
    }
    getApiPath() {
        return `${this.credentials.BITPAY_API_URL}/gift-cards`;
    }
    getBitPayInvoice(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.http
                .get(`${this.credentials.BITPAY_API_URL}/invoices/${id}`)
                .toPromise()
                .catch(err => {
                this.logger.error('BitPay Get Invoice: ERROR ' + err.error.message);
                throw err.error.message;
            });
            this.logger.info('BitPay Get Invoice: SUCCESS');
            return res.data;
        });
    }
    emailIsValid(email) {
        const validEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
        return validEmail;
    }
    storeEmail(email) {
        this.setUserInfo({ email });
    }
    setUserInfo(data) {
        this.persistenceProvider.setGiftCardUserInfo(JSON.stringify(data));
    }
};
InvoiceProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [EmailNotificationsProvider,
        HttpClient,
        Logger,
        PersistenceProvider])
], InvoiceProvider);
export { InvoiceProvider };
//# sourceMappingURL=invoice.js.map