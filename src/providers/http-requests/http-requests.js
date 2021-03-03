import { __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// providers
import { Logger } from '../../providers/logger/logger';
import { PlatformProvider } from '../platform/platform';
let HttpRequestsProvider = class HttpRequestsProvider {
    constructor(http, logger, platformProvider) {
        this.http = http;
        this.logger = logger;
        this.platformProvider = platformProvider;
        this.logger.debug('HttpRequestsProvider Provider initialized');
        this.isIOS = this.platformProvider.isIOS;
    }
    post(url, data, headers) {
        if (this.isIOS) {
            return new Observable(observer => {
                cordova.plugin.http.setDataSerializer('json');
                cordova.plugin.http.post(url, data, headers, res => {
                    try {
                        res.data = JSON.parse(res.data);
                    }
                    catch (e) {
                        // TODO
                    }
                    observer.next(res.data);
                    observer.complete();
                }, err => {
                    observer.error(err.error);
                });
            });
        }
        else
            return this.http.post(url, data, { headers });
    }
    get(url, params, headers) {
        if (this.isIOS) {
            return new Observable(observer => {
                cordova.plugin.http.setDataSerializer('json');
                cordova.plugin.http.get(url, params, headers, res => {
                    try {
                        res.data = JSON.parse(res.data);
                    }
                    catch (e) {
                        // TODO
                    }
                    observer.next(res.data);
                    observer.complete();
                }, err => {
                    observer.error(err.error);
                });
            });
        }
        else
            return this.http.get(url, { headers });
    }
};
HttpRequestsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        Logger,
        PlatformProvider])
], HttpRequestsProvider);
export { HttpRequestsProvider };
//# sourceMappingURL=http-requests.js.map