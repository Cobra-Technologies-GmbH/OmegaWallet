import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// providers
import { PersistenceProvider } from '../persistence/persistence';
import * as bitauthService from 'bitauth';
import * as _ from 'lodash';
let AppIdentityProvider = class AppIdentityProvider {
    constructor(logger, persistenceProvider) {
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.logger.debug('AppIdentityProvider initialized');
    }
    getIdentity(network, cb) {
        let pubkey;
        let isNew;
        this.persistenceProvider.getAppIdentity(network).then(data => {
            let appIdentity = data || {};
            if (_.isEmpty(appIdentity) || (appIdentity && !appIdentity.priv)) {
                isNew = true;
                appIdentity = bitauthService.generateSin();
            }
            try {
                pubkey = bitauthService.getPublicKeyFromPrivateKey(appIdentity.priv);
                bitauthService.getSinFromPublicKey(pubkey);
                if (isNew)
                    this.persistenceProvider.setAppIdentity(network, appIdentity);
            }
            catch (e) {
                return cb(e);
            }
            return cb(null, appIdentity);
        });
    }
};
AppIdentityProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        PersistenceProvider])
], AppIdentityProvider);
export { AppIdentityProvider };
//# sourceMappingURL=app-identity.js.map