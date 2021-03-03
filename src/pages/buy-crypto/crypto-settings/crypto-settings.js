import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';
// Pages
import { SimplexPage } from '../../../pages/integrations/simplex/simplex';
import { WyrePage } from '../../../pages/integrations/wyre/wyre';
// Providers
import { BuyCryptoProvider } from '../../../providers/buy-crypto/buy-crypto';
import { ConfigProvider } from '../../../providers/config/config';
import { HomeIntegrationsProvider } from '../../../providers/home-integrations/home-integrations';
import { Logger } from '../../../providers/logger/logger';
import { ThemeProvider } from '../../../providers/theme/theme';
let CryptoSettingsPage = class CryptoSettingsPage {
    constructor(configProvider, homeIntegrationsProvider, logger, navCtrl, buyCryptoProvider, themeProvider) {
        this.configProvider = configProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.logger = logger;
        this.navCtrl = navCtrl;
        this.buyCryptoProvider = buyCryptoProvider;
        this.themeProvider = themeProvider;
        this.serviceName = 'buycrypto';
        this.service = _.filter(this.homeIntegrationsProvider.get(), {
            name: this.serviceName
        });
        this.showInHome = !!this.service[0].show;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CryptoSettingsPage');
    }
    ionViewWillEnter() {
        this.buyCryptoProvider.getPaymentRequests().then(res => {
            this.simplexPaymentRequests = res.simplexPaymentRequests;
            this.wyrePaymentRequests = res.wyrePaymentRequests;
        });
    }
    goToSimplexPage() {
        this.navCtrl.push(SimplexPage);
    }
    goToWyrePage() {
        this.navCtrl.push(WyrePage);
    }
    showInHomeSwitch() {
        let opts = {
            showIntegration: { [this.serviceName]: this.showInHome }
        };
        this.homeIntegrationsProvider.updateConfig(this.serviceName, this.showInHome);
        this.configProvider.set(opts);
    }
};
CryptoSettingsPage = __decorate([
    Component({
        selector: 'page-crypto-settings',
        templateUrl: 'crypto-settings.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        HomeIntegrationsProvider,
        Logger,
        NavController,
        BuyCryptoProvider,
        ThemeProvider])
], CryptoSettingsPage);
export { CryptoSettingsPage };
//# sourceMappingURL=crypto-settings.js.map