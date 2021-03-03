import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
// Providers
import { BwcProvider } from '../bwc/bwc';
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';
import { PopupProvider } from '../popup/popup';
let KeyProvider = class KeyProvider {
    constructor(logger, bwcProvider, popupProvider, persistenceProvider, translate) {
        this.logger = logger;
        this.bwcProvider = bwcProvider;
        this.popupProvider = popupProvider;
        this.persistenceProvider = persistenceProvider;
        this.translate = translate;
        this.Key = this.bwcProvider.getKey();
        this.logger.debug('KeyProvider initialized');
        this.isDirty = false;
    }
    load() {
        this.logger.debug('loading keys');
        return this.persistenceProvider.getKeys().then((keys) => __awaiter(this, void 0, void 0, function* () {
            if (!keys)
                this.logger.debug('no keys found');
            this.keys = [];
            keys = keys ? keys : [];
            this.logger.debug(`typeof keys: ${typeof keys}`);
            if (typeof keys === 'string') {
                this.logger.debug('typeof keys = string. Trying to parse.');
                try {
                    keys = JSON.parse(keys);
                }
                catch (_) {
                    this.logger.warn('Could not parse');
                }
            }
            this.logger.debug(`keys length: ${keys.length}`);
            keys.forEach(k => {
                this.logger.debug(`storage keyid: ${k.id}`);
                this.keys.push(new this.Key({
                    seedType: 'object',
                    seedData: k
                }));
            });
            return Promise.resolve();
        }));
    }
    storeKeysIfDirty() {
        if (!this.isDirty) {
            this.logger.debug('The keys have not been saved. Not dirty');
            return Promise.resolve();
        }
        const keysToAdd = [];
        this.keys.forEach(k => {
            keysToAdd.push(k.toObj(k));
        });
        return this.persistenceProvider.setKeys(keysToAdd).then(() => {
            this.isDirty = false;
            return Promise.resolve();
        });
    }
    addKey(keyToAdd, replaceKey) {
        if (!keyToAdd)
            return Promise.resolve();
        const keyObject = keyToAdd.toObj();
        const keyIndex = this.keys.findIndex(k => this.isMatch(keyToAdd, k));
        if (keyIndex >= 0) {
            // only for encrypt/decrypt
            if (replaceKey)
                this.keys.splice(keyIndex, 1, new this.Key({
                    seedType: 'object',
                    seedData: keyObject
                }));
            else {
                this.logger.debug('NO adding key (duplicate): ', keyToAdd.id);
                return Promise.resolve();
            }
        }
        else {
            this.keys.push(new this.Key({
                seedType: 'object',
                seedData: keyObject
            }));
        }
        this.isDirty = true;
        return this.storeKeysIfDirty();
    }
    addKeys(keysToAdd) {
        keysToAdd.forEach(keyToAdd => {
            const keyObject = keyToAdd.toObj();
            if (!this.keys.find(k => this.isMatch(keyObject, k))) {
                this.keys.push(new this.Key({
                    seedType: 'object',
                    seedData: keyObject
                }));
                this.isDirty = true;
            }
            else {
                this.logger.warn('Key already added');
            }
        });
        return this.storeKeysIfDirty();
    }
    getKey(keyId) {
        let selectedKey = this.keys.find(k => k.id == keyId);
        if (selectedKey) {
            return selectedKey;
        }
        else {
            this.logger.debug('No matches for key id: ' + keyId);
            return null;
        }
    }
    removeKey(keyId) {
        this.logger.debug('Removing key: ' + keyId);
        if (keyId === 'read-only')
            return Promise.resolve();
        const selectedKey = this.keys.findIndex(k => k.id == keyId);
        if (selectedKey >= 0) {
            this.keys.splice(selectedKey, 1);
            this.isDirty = true;
            return this.storeKeysIfDirty();
        }
        else {
            const err = 'No matches for key id: ' + keyId;
            this.logger.debug(err);
            return Promise.reject(err);
        }
    }
    // An alert dialog
    askPassword(warnMsg, title) {
        const opts = {
            type: 'password',
            useDanger: true
        };
        return this.popupProvider.ionicPrompt(title, warnMsg, opts);
    }
    encrypt(keyId) {
        const key = this.getKey(keyId);
        let title = this.translate.instant('Enter a new encrypt password');
        const warnMsg = this.translate.instant('Your wallet key will be encrypted. The encrypt password cannot be recovered. Be sure to write it down.');
        return this.askPassword(warnMsg, title).then((password) => {
            if (password == '' || _.isNull(password)) {
                return Promise.reject(this.translate.instant('No password'));
            }
            title = this.translate.instant('Confirm your new encrypt password');
            return this.askPassword(warnMsg, title).then((password2) => {
                if (password != password2 || _.isNull(password2)) {
                    return Promise.reject(this.translate.instant('Password mismatch'));
                }
                try {
                    this.encryptPrivateKey(key, password);
                }
                catch (error) {
                    return Promise.reject(error);
                }
                return Promise.resolve();
            });
        });
    }
    showWarningNoEncrypt() {
        const title = this.translate.instant('Are you sure?');
        const msg = this.translate.instant('Without encryption, a thief or another application on this device may be able to access your funds.');
        const okText = this.translate.instant("I'm sure");
        const cancelText = this.translate.instant('Go Back');
        return this.popupProvider.ionicConfirm(title, msg, okText, cancelText);
    }
    decrypt(keyId) {
        const key = this.getKey(keyId);
        return this.askPassword(null, this.translate.instant('Enter encrypt password')).then((password) => {
            if (password == '' || _.isNull(password)) {
                return Promise.reject(this.translate.instant('No password'));
            }
            try {
                this.decryptPrivateKey(key, password);
            }
            catch (e) {
                return Promise.reject('WRONG_PASSWORD');
            }
            return Promise.resolve();
        });
    }
    handleEncryptedWallet(keyId) {
        if (!keyId) {
            return Promise.resolve();
        }
        const key = this.getKey(keyId);
        const isPrivKeyEncrypted = this.isPrivKeyEncrypted(keyId);
        if (!isPrivKeyEncrypted)
            return Promise.resolve();
        return this.askPassword(null, this.translate.instant('Enter encrypt password')).then((password) => {
            if (_.isNull(password)) {
                return Promise.reject(new Error('PASSWORD_CANCELLED'));
            }
            else if (password == '') {
                return Promise.reject(new Error('NO_PASSWORD'));
            }
            else if (!key.checkPassword(password)) {
                return Promise.reject(new Error('WRONG_PASSWORD'));
            }
            else {
                return Promise.resolve(password);
            }
        });
    }
    isPrivKeyEncrypted(keyId) {
        if (!keyId)
            return false;
        const key = this.getKey(keyId);
        return key ? key.isPrivKeyEncrypted() : undefined;
    }
    isDeletedSeed(keyId) {
        const key = this.getKey(keyId);
        if (!key)
            return true;
        const keyObj = key.toObj();
        return !keyObj.mnemonic && !keyObj.mnemonicEncrypted;
    }
    mnemonicHasPassphrase(keyId) {
        if (!keyId)
            return false;
        const key = this.getKey(keyId).toObj();
        return key.mnemonicHasPassphrase;
    }
    get(keyId, password) {
        const key = this.getKey(keyId);
        return key.get(password);
    }
    getBaseAddressDerivationPath(keyId, opts) {
        const key = this.getKey(keyId);
        return key.getBaseAddressDerivationPath(opts);
    }
    encryptPrivateKey(key, password) {
        key.encrypt(password);
    }
    decryptPrivateKey(key, password) {
        key.decrypt(password);
    }
    sign(keyId, rootPath, txp, password) {
        if (!keyId) {
            this.logger.warn("Can't sign. No key provided");
            return;
        }
        const key = this.getKey(keyId);
        if (!key) {
            this.logger.warn(`Can't sign. The  key ${keyId} was no found.`);
            throw new Error(`Key ${keyId} not found on this device`);
        }
        return key.sign(rootPath, txp, password);
    }
    isMatch(key1, key2) {
        // return this.Key.match(key1, key2); TODO needs to be fixed on bwc
        if (key1.fingerPrint && key2.fingerPrint)
            return key1.fingerPrint === key2.fingerPrint;
        else
            return key1.id === key2.id;
    }
    getMatchedKey(key) {
        return this.keys.find(k => this.isMatch(key, k));
    }
};
KeyProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        BwcProvider,
        PopupProvider,
        PersistenceProvider,
        TranslateService])
], KeyProvider);
export { KeyProvider };
//# sourceMappingURL=key.js.map