import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Logger } from '../../logger/logger';
import { KeyAlreadyExistsError } from './istorage';
let LocalStorage = class LocalStorage {
    constructor(logger) {
        this.logger = logger;
        if (!window.localStorage)
            throw new Error('localstorage not available');
        this.ls = window.localStorage;
    }
    processValue(v) {
        if (!v)
            return null;
        if (!_.isString(v))
            return v;
        let parsed;
        try {
            parsed = JSON.parse(v);
        }
        catch (e) {
            // TODO parse is not necessary
        }
        return parsed || v;
    }
    get(k) {
        return new Promise(resolve => {
            let v = this.ls.getItem(k);
            return resolve(this.processValue(v));
        });
    }
    set(k, v) {
        return new Promise(resolve => {
            if (_.isObject(v))
                v = JSON.stringify(v);
            if (!_.isString(v))
                v = v.toString();
            this.ls.setItem(k, v);
            resolve();
        });
    }
    remove(k) {
        return new Promise(resolve => {
            this.ls.removeItem(k);
            this.logger.debug(`Storage Key: ${k} removed`);
            resolve();
        });
    }
    create(k, v) {
        return this.get(k).then(data => {
            if (data)
                throw new KeyAlreadyExistsError();
            this.set(k, v);
        });
    }
};
LocalStorage = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger])
], LocalStorage);
export { LocalStorage };
//# sourceMappingURL=local-storage.js.map