import { __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppProvider } from '../../providers/app/app';
import { Logger } from '../../providers/logger/logger';
let ReleaseProvider = class ReleaseProvider {
    constructor(http, appProvider, logger) {
        this.http = http;
        this.appProvider = appProvider;
        this.logger = logger;
        this.latestReleaseAPIUrl = 'https://bws.omega.eco/bws/api/latest-version';
        this.appVersion = this.appProvider.info.version;
    }
    getLatestAppVersion() {
        return new Promise(resolve => {
            this.http.get(this.latestReleaseAPIUrl).subscribe(data => {
                return resolve(data);
            });
        });
    }
    getCurrentAppVersion() {
        return this.appVersion;
    }
    verifyTagFormat(tag) {
        var regex = /^v?\d+\.\d+\.\d+$/i;
        return regex.exec(tag);
    }
    formatTagNumber(tag) {
        var formattedNumber = tag.replace(/^v/i, '').split('.');
        return {
            major: +formattedNumber[0],
            minor: +formattedNumber[1],
            patch: +formattedNumber[2]
        };
    }
    newReleaseAvailable(latestVersion) {
        const currentVersion = this.getCurrentAppVersion();
        if (!this.verifyTagFormat(latestVersion) ||
            !this.verifyTagFormat(currentVersion)) {
            this.logger.error(`Cannot verify the format of version tag. latestVersion ${latestVersion} - currentVersion ${currentVersion}`);
            return false;
        }
        let current = this.formatTagNumber(currentVersion);
        let latest = this.formatTagNumber(latestVersion);
        if (latest.major > current.major) {
            this.logger.debug('Major version is available');
            return true;
        }
        return false;
    }
};
ReleaseProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        AppProvider,
        Logger])
], ReleaseProvider);
export { ReleaseProvider };
//# sourceMappingURL=release.js.map