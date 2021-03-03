import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// providers
import { ConfigProvider } from '../config/config';
import { ProfileProvider } from '../profile/profile';
import { WalletProvider } from '../wallet/wallet';
import * as _ from 'lodash';
let EmailNotificationsProvider = class EmailNotificationsProvider {
    constructor(configProvider, profileProvider, walletProvider, logger) {
        this.configProvider = configProvider;
        this.profileProvider = profileProvider;
        this.walletProvider = walletProvider;
        this.logger = logger;
        this.logger.debug('EmailNotificationsProvider initialized');
    }
    updateEmail(opts) {
        opts = opts || {};
        if (!opts.email)
            return;
        this.configProvider.set({
            emailFor: null,
            emailNotifications: {
                enabled: opts.enabled,
                email: opts.enabled ? opts.email : null
            }
        });
        setTimeout(() => {
            const opts = {
                showHidden: true
            };
            let wallets = this.profileProvider.getWallets(opts);
            this.walletProvider.updateRemotePreferences(wallets);
        }, 1000);
    }
    getEmailIfEnabled(config) {
        config = config ? config : this.configProvider.get();
        if (config.emailNotifications) {
            if (!config.emailNotifications.enabled)
                return;
            if (config.emailNotifications.email)
                return config.emailNotifications.email;
        }
        if (_.isEmpty(config.emailFor))
            return;
        // Backward compatibility
        let emails = _.values(config.emailFor);
        for (var i = 0; i < emails.length; i++) {
            if (emails[i] !== null && typeof emails[i] !== 'undefined') {
                return emails[i];
            }
        }
    }
    init() {
        let config = this.configProvider.get();
        if (config.emailNotifications && config.emailNotifications.enabled) {
            // If email already set
            if (config.emailNotifications.email)
                return;
            var currentEmail = this.getEmailIfEnabled(config);
            this.updateEmail({
                enabled: currentEmail ? true : false,
                email: currentEmail
            });
        }
    }
};
EmailNotificationsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigProvider,
        ProfileProvider,
        WalletProvider,
        Logger])
], EmailNotificationsProvider);
export { EmailNotificationsProvider };
//# sourceMappingURL=email-notifications.js.map