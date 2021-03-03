import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { FCMNG } from 'fcm-ng';
import { PlatformProvider } from '../platform/platform';
let AnalyticsProvider = class AnalyticsProvider {
    constructor(FCMPlugin, platformProvider) {
        this.FCMPlugin = FCMPlugin;
        this.platformProvider = platformProvider;
    }
    logEvent(eventName, eventParams) {
        if (this.platformProvider.isCordova)
            this.FCMPlugin.logEvent(eventName, eventParams);
    }
    setUserProperty(name, value) {
        if (this.platformProvider.isCordova)
            this.FCMPlugin.setUserProperty(name, value);
    }
};
AnalyticsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [FCMNG,
        PlatformProvider])
], AnalyticsProvider);
export { AnalyticsProvider };
//# sourceMappingURL=analytics.js.map