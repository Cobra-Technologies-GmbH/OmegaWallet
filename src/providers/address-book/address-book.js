import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../providers/logger/logger';
import { PersistenceProvider } from '../../providers/persistence/persistence';
import { AddressProvider } from '../address/address';
import * as _ from 'lodash';
let AddressBookProvider = class AddressBookProvider {
    constructor(logger, persistenceProvider, translate, addressProvider) {
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.translate = translate;
        this.addressProvider = addressProvider;
        this.logger.debug('AddressBookProvider initialized');
    }
    get(addr) {
        return new Promise((resolve, reject) => {
            this.persistenceProvider
                .getAddressBook('testnet')
                .then(ab => {
                if (ab && _.isString(ab))
                    ab = JSON.parse(ab);
                if (ab && ab[addr])
                    return resolve(ab[addr]);
                this.persistenceProvider
                    .getAddressBook('livenet')
                    .then(ab => {
                    if (ab && _.isString(ab))
                        ab = JSON.parse(ab);
                    if (ab && ab[addr])
                        return resolve(ab[addr]);
                    return resolve();
                })
                    .catch(() => {
                    return reject();
                });
            })
                .catch(() => {
                return reject();
            });
        });
    }
    list() {
        return new Promise((resolve, reject) => {
            this.persistenceProvider
                .getAddressBook('testnet')
                .then(ab => {
                if (ab && _.isString(ab))
                    ab = JSON.parse(ab);
                ab = ab || {};
                this.persistenceProvider
                    .getAddressBook('livenet')
                    .then(ab2 => {
                    if (ab2 && _.isString(ab))
                        ab2 = JSON.parse(ab2);
                    ab2 = ab2 || {};
                    return resolve(_.defaults(ab2, ab));
                })
                    .catch(err => {
                    return reject(err);
                });
            })
                .catch(() => {
                let msg = this.translate.instant('Could not get the Addressbook');
                return reject(msg);
            });
        });
    }
    add(entry) {
        return new Promise((resolve, reject) => {
            const addrData = this.addressProvider.getCoinAndNetwork(entry.address);
            if (_.isEmpty(addrData)) {
                let msg = this.translate.instant('Not valid bitcoin address');
                return reject(msg);
            }
            this.persistenceProvider
                .getAddressBook(addrData.network)
                .then(ab => {
                if (ab && _.isString(ab))
                    ab = JSON.parse(ab);
                ab = ab || {};
                if (_.isArray(ab))
                    ab = {}; // No array
                if (ab[entry.address]) {
                    let msg = this.translate.instant('Entry already exist');
                    return reject(msg);
                }
                ab[entry.address] = entry;
                this.persistenceProvider
                    .setAddressBook(addrData.network, JSON.stringify(ab))
                    .then(() => {
                    this.list()
                        .then(ab => {
                        return resolve(ab);
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(() => {
                    let msg = this.translate.instant('Error adding new entry');
                    return reject(msg);
                });
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    remove(addr) {
        return new Promise((resolve, reject) => {
            const addrData = this.addressProvider.getCoinAndNetwork(addr);
            if (_.isEmpty(addrData)) {
                let msg = this.translate.instant('Not valid bitcoin address');
                return reject(msg);
            }
            this.persistenceProvider
                .getAddressBook(addrData.network)
                .then(ab => {
                if (ab && _.isString(ab))
                    ab = JSON.parse(ab);
                ab = ab || {};
                if (_.isEmpty(ab)) {
                    let msg = this.translate.instant('Addressbook is empty');
                    return reject(msg);
                }
                if (!ab[addr]) {
                    let msg = this.translate.instant('Entry does not exist');
                    return reject(msg);
                }
                delete ab[addr];
                this.persistenceProvider
                    .setAddressBook(addrData.network, JSON.stringify(ab))
                    .then(() => {
                    this.list()
                        .then(ab => {
                        return resolve(ab);
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(() => {
                    let msg = this.translate.instant('Error deleting entry');
                    return reject(msg);
                });
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
};
AddressBookProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        PersistenceProvider,
        TranslateService,
        AddressProvider])
], AddressBookProvider);
export { AddressBookProvider };
//# sourceMappingURL=address-book.js.map