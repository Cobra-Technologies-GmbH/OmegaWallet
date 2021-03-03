import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// providers
import { PersistenceProvider } from '../persistence/persistence';
let TxConfirmNotificationProvider = class TxConfirmNotificationProvider {
    constructor(logger, persistenceProvider) {
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.logger.debug('TxConfirmNotificationProvider initialized');
    }
    checkIfEnabled(txid) {
        return new Promise((resolve, reject) => {
            this.persistenceProvider
                .getTxConfirmNotification(txid)
                .then(res => {
                return resolve(!!res);
            })
                .catch(err => {
                this.logger.error(err);
                return reject(err);
            });
        });
    }
    subscribe(client, opts) {
        client.txConfirmationSubscribe(opts, err => {
            if (err)
                this.logger.error(err);
            this.persistenceProvider
                .setTxConfirmNotification(opts.txid, true)
                .catch(err => {
                this.logger.error(err);
                return;
            });
        });
    }
    unsubscribe(client, txId) {
        client.txConfirmationUnsubscribe(txId, err => {
            if (err)
                this.logger.error(err);
            this.persistenceProvider.removeTxConfirmNotification(txId).catch(err => {
                this.logger.error(err);
                return;
            });
        });
    }
};
TxConfirmNotificationProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        PersistenceProvider])
], TxConfirmNotificationProvider);
export { TxConfirmNotificationProvider };
//# sourceMappingURL=tx-confirm-notification.js.map