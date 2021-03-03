import { __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import * as _ from 'lodash';
const exchangeList = [
    { name: 'coinbase' },
    { name: 'walletConnect' }
];
let HomeIntegrationsProvider = class HomeIntegrationsProvider {
    constructor(http, logger) {
        this.http = http;
        this.logger = logger;
        this.logger.debug('HomeIntegrationsProviders initialized');
        this.services = [];
    }
    register(serviceInfo) {
        // Check if already exists
        if (_.find(this.services, { name: serviceInfo.name }))
            return;
        this.logger.info('Adding home Integrations entry:' + serviceInfo.name);
        this.services.push(serviceInfo);
    }
    unregister(serviceName) {
        this.services = _.filter(this.services, x => {
            return x.name != serviceName;
        });
    }
    updateLink(serviceName, token) {
        this.services = _.filter(this.services, x => {
            if (x.name == serviceName)
                x.linked = !!token;
            return x;
        });
    }
    updateConfig(serviceName, show) {
        this.services = _.filter(this.services, x => {
            if (x.name == serviceName)
                x.show = !!show;
            return x;
        });
    }
    shouldShowInHome(serviceName) {
        const service = this.services.find(i => i.name === serviceName);
        if (service && service.name === 'debitcard') {
            return service && service.show && !service.linked;
        }
        else
            return service && service.show;
    }
    get() {
        return _.orderBy(this.services, ['name'], ['asc']);
    }
    getAvailableExchange() {
        let exchangeServices = _.intersectionBy(this.services, exchangeList, 'name');
        return _.filter(exchangeServices, { linked: true, show: true });
    }
};
HomeIntegrationsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient, Logger])
], HomeIntegrationsProvider);
export { HomeIntegrationsProvider };
//# sourceMappingURL=home-integrations.js.map