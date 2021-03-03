import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';
// Pages
import { ChangellyPage } from '../../../pages/integrations/changelly/changelly';
// Providers
import { ConfigProvider } from '../../../providers/config/config';
import { ExchangeCryptoProvider } from '../../../providers/exchange-crypto/exchange-crypto';
import { HomeIntegrationsProvider } from '../../../providers/home-integrations/home-integrations';
import { Logger } from '../../../providers/logger/logger';
import { ThemeProvider } from '../../../providers/theme/theme';
let ExchangeCryptoSettingsPage = class ExchangeCryptoSettingsPage {
    constructor(configProvider, homeIntegrationsProvider, logger, themeProvider, exchangeCryptoProvider, navCtrl) {
        this.configProvider = configProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.logger = logger;
        this.themeProvider = themeProvider;
        this.exchangeCryptoProvider = exchangeCryptoProvider;
        this.navCtrl = navCtrl;
        this.serviceName = 'exchangecrypto';
        this.service = _.filter(this.homeIntegrationsProvider.get(), {
            name: this.serviceName
        });
        this.showInHome = !!this.service[0].show;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: ExchangeCryptoSettingsPage');
    }
    ionViewWillEnter() {
        this.exchangeCryptoProvider.getSwapTxs().then(res => {
            this.changellySwapTxs = res.changellySwapTxs;
            // this.shpeshiftSwapTxs = res.shpeshiftSwapTxs;
        });
    }
    showInHomeSwitch() {
        let opts = {
            showIntegration: { [this.serviceName]: this.showInHome }
        };
        this.homeIntegrationsProvider.updateConfig(this.serviceName, this.showInHome);
        this.configProvider.set(opts);
    }
    goToChangellyPage() {
        this.navCtrl.push(ChangellyPage);
    }
};
ExchangeCryptoSettingsPage = __decorate([
    Component({
        selector: 'page-exchange-crypto-settings',
        templateUrl: 'exchange-crypto-settings.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        HomeIntegrationsProvider,
        Logger,
        ThemeProvider,
        ExchangeCryptoProvider,
        NavController])
], ExchangeCryptoSettingsPage);
export { ExchangeCryptoSettingsPage };
//# sourceMappingURL=exchange-crypto-settings.js.map