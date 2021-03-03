import { __awaiter, __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { File } from '@ionic-native/file';
// providers
import { ConfigProvider } from '../../providers/config/config';
import { LanguageProvider } from '../../providers/language/language';
import { Logger } from '../../providers/logger/logger';
import { PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../platform/platform';
import { ThemeProvider } from '../theme/theme';
let AppProvider = class AppProvider {
    constructor(http, logger, language, config, persistence, file, platformProvider, themeProvider) {
        this.http = http;
        this.logger = logger;
        this.language = language;
        this.config = config;
        this.persistence = persistence;
        this.file = file;
        this.platformProvider = platformProvider;
        this.themeProvider = themeProvider;
        this.info = {};
        this.jsonPathApp = 'assets/appConfig.json';
        this.jsonPathServices = 'assets/externalServices.json';
        this.logger.debug('AppProvider initialized');
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([this.getInfo(), this.loadProviders()]);
        });
    }
    setTotalBalance() {
        this.persistence.getTotalBalance().then(data => {
            if (!data)
                return;
            if (_.isString(data)) {
                data = JSON.parse(data);
            }
            this.homeBalance = data;
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            [this.servicesInfo, this.info] = yield Promise.all([
                this.getServicesInfo(),
                this.getAppInfo()
            ]);
            if (this.platformProvider.isCordova) {
                this.info = JSON.parse(this.info);
                this.servicesInfo = JSON.parse(this.servicesInfo);
            }
            this.version = this.formatVersionString();
        });
    }
    formatVersionString() {
        var formattedNumber = this.info.version.replace(/^v/i, '').split('.');
        return {
            major: +formattedNumber[0],
            minor: +formattedNumber[1],
            patch: +formattedNumber[2]
        };
    }
    loadProviders() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.persistence.load();
            yield this.config.load();
            yield this.themeProvider.load();
            yield this.language.load();
        });
    }
    getAppInfo() {
        if (this.platformProvider.isCordova) {
            return this.file.readAsText(this.file.applicationDirectory + 'www/', this.jsonPathApp);
        }
        else {
            return this.http.get(this.jsonPathApp).toPromise();
        }
    }
    getServicesInfo() {
        if (this.platformProvider.isCordova) {
            return this.file.readAsText(this.file.applicationDirectory + 'www/', this.jsonPathServices);
        }
        else {
            return this.http.get(this.jsonPathServices).toPromise();
        }
    }
};
AppProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        Logger,
        LanguageProvider,
        ConfigProvider,
        PersistenceProvider,
        File,
        PlatformProvider,
        ThemeProvider])
], AppProvider);
export { AppProvider };
//# sourceMappingURL=app.js.map