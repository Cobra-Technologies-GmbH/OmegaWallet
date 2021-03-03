import { __decorate, __metadata } from "tslib";
/* tslint:disable:no-console */
import { Injectable, isDevMode } from '@angular/core';
import * as _ from 'lodash';
let Logger = class Logger {
    constructor() {
        this.logs = [];
        this.levels = [
            { level: 'error', weight: 1, label: 'Error', def: false },
            { level: 'warn', weight: 2, label: 'Warning', def: false },
            { level: 'info', weight: 3, label: 'Info', def: true },
            { level: 'debug', weight: 4, label: 'Debug', def: false }
        ];
        // Create an array of level weights for performant filtering.
        this.weight = {};
        for (let i = 0; i < this.levels.length; i++) {
            this.weight[this.levels[i].level] = this.levels[i].weight;
        }
    }
    getMessage(message) {
        const isUndefined = _.isUndefined(message);
        const isNull = _.isNull(message);
        const isError = _.isError(message);
        const isObject = _.isObject(message);
        if (isUndefined)
            return 'undefined';
        else if (isNull)
            return 'null';
        else if (isError)
            return message.message;
        else if (isObject)
            return JSON.stringify(message);
        else
            return message;
    }
    error(_message, ..._optionalParams) {
        const type = 'error';
        const args = this.processingArgs(arguments);
        this.log(`[${type}] ${args}`);
        this.add(type, args);
    }
    debug(_message, ..._optionalParams) {
        const type = 'debug';
        const args = this.processingArgs(arguments);
        if (isDevMode())
            this.log(`[${type}] ${args}`);
        this.add(type, args);
    }
    info(_message, ..._optionalParams) {
        const type = 'info';
        const args = this.processingArgs(arguments);
        if (isDevMode())
            this.log(`[${type}] ${args}`);
        this.add(type, args);
    }
    warn(_message, ..._optionalParams) {
        const type = 'warn';
        const args = this.processingArgs(arguments);
        if (isDevMode())
            this.log(`[${type}] ${args}`);
        this.add(type, args);
    }
    getLevels() {
        return this.levels;
    }
    getWeight(weight) {
        return _.find(this.levels, l => {
            return l.weight == weight;
        });
    }
    getDefaultWeight() {
        return _.find(this.levels, l => {
            return l.def;
        });
    }
    add(level, msg) {
        msg = msg.replace('/xpriv.*/', '[...]');
        msg = msg.replace('/walletPrivKey.*/', 'walletPrivKey:[...]');
        const newLog = {
            timestamp: new Date().toISOString(),
            level,
            msg
        };
        this.logs.push(newLog);
    }
    /**
     * Returns logs of <= to filteredWeight
     * @param {number} filteredWeight Weight (1-4) to use when filtering logs. optional
     */
    get(filterWeight) {
        let filteredLogs = this.logs;
        if (filterWeight != undefined) {
            filteredLogs = _.filter(this.logs, l => {
                return this.weight[l.level] <= filterWeight;
            });
        }
        return filteredLogs;
    }
    processingArgs(argsValues) {
        let args = Array.prototype.slice.call(argsValues);
        args = args.map(v => {
            try {
                v = this.getMessage(v);
            }
            catch (e) {
                console.log('Error at log decorator:', e);
                v = 'Unknown message';
            }
            return v;
        });
        return args.join(' ');
    }
    log(msg, ...optionalParams) {
        console.log(msg, ...optionalParams);
    }
};
Logger = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], Logger);
export { Logger };
//# sourceMappingURL=logger.js.map