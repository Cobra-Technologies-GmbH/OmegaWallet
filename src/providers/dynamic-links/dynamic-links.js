import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { FCMNG } from 'fcm-ng';
import { Events } from 'ionic-angular';
import { IncomingDataProvider } from '../incoming-data/incoming-data';
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';
let DynamicLinksProvider = class DynamicLinksProvider {
    constructor(logger, events, FCMPlugin, incomingDataProvider, platformProvider, persistenceProvider) {
        this.logger = logger;
        this.events = events;
        this.FCMPlugin = FCMPlugin;
        this.incomingDataProvider = incomingDataProvider;
        this.platformProvider = platformProvider;
        this.persistenceProvider = persistenceProvider;
        this.logger.debug('DynamicLinksProvider initialized');
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let dynLink;
            dynLink = this.platformProvider.isIOS
                ? yield this.onDynamicLink()
                : yield this.getDynamicLink();
            this.logger.debug('Firebase Dynamic Link Data: ', JSON.stringify(dynLink));
            if (dynLink && dynLink.deepLink)
                this.processDeepLink(dynLink.deepLink);
        });
    }
    getDynamicLink() {
        return new Promise(resolve => {
            this.FCMPlugin.getDynamicLink().subscribe(data => {
                if (data && data.deepLink && data.newInstall)
                    this.persistenceProvider.setDynamicLink(data.deepLink);
                resolve(data);
            });
        });
    }
    onDynamicLink() {
        return this.FCMPlugin.onDynamicLink();
    }
    createDynamicLink(params) {
        return this.FCMPlugin.createDynamicLink(params);
    }
    processDeepLink(deepLink) {
        const view = this.incomingDataProvider.getParameterByName('view', deepLink);
        const stateParams = { deepLink: true };
        const nextView = {
            name: view,
            params: stateParams
        };
        this.events.publish('IncomingDataRedir', nextView);
    }
};
DynamicLinksProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        Events,
        FCMNG,
        IncomingDataProvider,
        PlatformProvider,
        PersistenceProvider])
], DynamicLinksProvider);
export { DynamicLinksProvider };
//# sourceMappingURL=dynamic-links.js.map