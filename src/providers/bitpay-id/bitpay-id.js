import { __awaiter, __decorate, __metadata } from "tslib";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// providers
import { Device } from '@ionic-native/device';
import * as bitauthService from 'bitauth';
import { Events } from 'ionic-angular';
import { AppIdentityProvider } from '../app-identity/app-identity';
import { InAppBrowserProvider } from '../in-app-browser/in-app-browser';
import { Network, PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';
let BitPayIdProvider = class BitPayIdProvider {
    constructor(http, appIdentityProvider, logger, device, platformProvider, persistenceProvider, iab, events) {
        this.http = http;
        this.appIdentityProvider = appIdentityProvider;
        this.logger = logger;
        this.device = device;
        this.platformProvider = platformProvider;
        this.persistenceProvider = persistenceProvider;
        this.iab = iab;
        this.events = events;
        this.deviceName = 'unknown device';
        this.logger.debug('BitPayProvider initialized');
        if (this.platformProvider.isElectron) {
            this.deviceName = this.platformProvider.getOS().OSName;
        }
        else if (this.platformProvider.isCordova) {
            this.deviceName = this.device.model;
        }
    }
    setNetwork(network) {
        this.NETWORK = network;
        this.BITPAY_API_URL =
            this.NETWORK == 'livenet'
                ? 'https://bitpay.com'
                : 'https://test.bitpay.com';
        this.logger.log(`Omega ID provider initialized with ${this.NETWORK}`);
    }
    getEnvironment() {
        return {
            network: this.NETWORK
        };
    }
    generatePairingToken(payload, successCallback, errorCallback) {
        const network = Network[this.getEnvironment().network];
        this.appIdentityProvider.getIdentity(network, (err, appIdentity) => {
            if (err) {
                alert(err);
                return errorCallback(err);
            }
            const { secret, code } = payload;
            const params = {
                secret,
                version: 2,
                deviceName: this.deviceName
            };
            if (code) {
                params['code'] = code;
            }
            let json = {
                method: 'createToken',
                params
            };
            let dataToSign = JSON.stringify(json['params']);
            let signedData = bitauthService.sign(dataToSign, appIdentity.priv);
            bitauthService.verifySignature(dataToSign, appIdentity.pub, signedData, () => __awaiter(this, void 0, void 0, function* () {
                json['params'].signature = bitauthService.sign(dataToSign, appIdentity.priv);
                json['params'].pubkey = appIdentity.pub;
                json['params'] = JSON.stringify(json.params);
                const url = `${this.BITPAY_API_URL}/api/v2/`;
                let headers = new HttpHeaders().set('content-type', 'application/json');
                try {
                    const token = yield this.http
                        // @ts-ignore
                        .post(url, json, { headers })
                        .toPromise();
                    json = {
                        method: 'getBasicInfo',
                        token: token.data
                    };
                    dataToSign = `${url}${token.data}${JSON.stringify(json)}`;
                    signedData = bitauthService.sign(dataToSign, appIdentity.priv);
                    headers = headers.append('x-identity', appIdentity.pub);
                    headers = headers.append('x-signature', signedData);
                    const user = yield this.http
                        .post(`${url}${token.data}`, json, { headers })
                        .toPromise();
                    if (user) {
                        if (user.error) {
                            errorCallback(user.error);
                            return;
                        }
                        this.logger.debug('BitPayID: successfully paired');
                        const { data } = user;
                        const { email, familyName, givenName, experiments } = data;
                        if (experiments && experiments.includes('NADebitCard')) {
                            this.persistenceProvider.setCardExperimentFlag('enabled');
                            this.events.publish('experimentUpdateStart');
                        }
                        yield Promise.all([
                            this.persistenceProvider.setBitPayIdPairingToken(network, token.data),
                            this.persistenceProvider.setBitPayIdUserInfo(network, data),
                            this.persistenceProvider.setBitpayAccount(network, {
                                email,
                                token: token.data,
                                familyName: familyName || '',
                                givenName: givenName || ''
                            })
                        ]);
                        successCallback(data);
                    }
                }
                catch (err) {
                    alert(JSON.stringify(err));
                    errorCallback(err);
                }
            }), err => {
                errorCallback(err);
            });
        });
    }
    apiCall(method, params = {}, userShopperToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.BITPAY_API_URL}/api/v2/`;
            let token = userShopperToken ||
                (yield this.persistenceProvider.getBitPayIdPairingToken(Network[this.NETWORK]));
            const json = {
                method,
                params: JSON.stringify(params),
                token
            };
            const dataToSign = `${url}${token}${JSON.stringify(json)}`;
            const appIdentity = (yield this.getAppIdentity());
            const signedData = bitauthService.sign(dataToSign, appIdentity.priv);
            let headers = new HttpHeaders().set('content-type', 'application/json');
            headers = headers.append('x-identity', appIdentity.pub);
            headers = headers.append('x-signature', signedData);
            const res = yield this.http
                .post(`${url}${token}`, json, { headers })
                .toPromise();
            if (res && res.error) {
                throw new Error(res.error);
            }
            return (res && res.data) || res;
        });
    }
    unlockInvoice(invoiceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isPaired = !!(yield this.persistenceProvider.getBitPayIdPairingToken(Network[this.NETWORK]));
            if (!isPaired)
                return 'pairingRequired';
            const tokens = yield this.apiCall('getProductTokens');
            const { token } = tokens.find(t => t.facade === 'userShopper');
            if (!token)
                return 'userShopperNotFound';
            const { meetsRequiredTier } = yield this.apiCall('unlockInvoice', { invoiceId }, token);
            if (!meetsRequiredTier)
                return 'tierNotMet';
            return 'unlockSuccess';
        });
    }
    getAppIdentity() {
        const network = Network[this.getEnvironment().network];
        return new Promise((resolve, reject) => {
            this.appIdentityProvider.getIdentity(network, (err, appIdentity) => {
                if (err) {
                    return reject(err);
                }
                resolve(appIdentity);
            });
        });
    }
    disconnectBitPayID(successCallback, errorCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = Network[this.getEnvironment().network];
            // @ts-ignore
            const user = yield this.persistenceProvider.getBitPayIdUserInfo(network);
            try {
                yield Promise.all([
                    this.persistenceProvider.removeBitPayIdPairingToken(network),
                    this.persistenceProvider.removeBitPayIdUserInfo(network),
                    this.persistenceProvider.removeBitpayAccountV2(network)
                ]);
                this.iab.refs.card.executeScript({
                    code: `window.postMessage(${JSON.stringify({
                        message: 'bitpayIdDisconnected'
                    })}, '*')`
                }, () => {
                    successCallback();
                });
            }
            catch (err) {
                errorCallback(err);
            }
        });
    }
};
BitPayIdProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        AppIdentityProvider,
        Logger,
        Device,
        PlatformProvider,
        PersistenceProvider,
        InAppBrowserProvider,
        Events])
], BitPayIdProvider);
export { BitPayIdProvider };
//# sourceMappingURL=bitpay-id.js.map