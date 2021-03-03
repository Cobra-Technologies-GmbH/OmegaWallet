import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as _ from 'lodash';
// Providers
import { CoinbaseProvider } from '../../../../providers/coinbase/coinbase';
import { ConfigProvider } from '../../../../providers/config/config';
import { HomeIntegrationsProvider } from '../../../../providers/home-integrations/home-integrations';
import { PopupProvider } from '../../../../providers/popup/popup';
import { CoinbasePage } from '../coinbase';
let CoinbaseSettingsPage = class CoinbaseSettingsPage {
    constructor(navCtrl, popupProvider, coinbaseProvider, configProvider, homeIntegrationsProvider) {
        this.navCtrl = navCtrl;
        this.popupProvider = popupProvider;
        this.coinbaseProvider = coinbaseProvider;
        this.configProvider = configProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.serviceName = 'coinbase';
        this.data = {};
        this.service = _.filter(this.homeIntegrationsProvider.get(), {
            name: this.serviceName
        });
        this.showInHome = !!this.service[0].show;
    }
    ionViewWillEnter() {
        this.hasCredentials = !!this.coinbaseProvider.oauthUrl;
        this.linkedAccount = this.coinbaseProvider.isLinked();
        if (this.linkedAccount)
            this.coinbaseProvider.getCurrentUser(this.data);
    }
    showInHomeSwitch() {
        let opts = {
            showIntegration: { [this.serviceName]: this.showInHome }
        };
        this.homeIntegrationsProvider.updateConfig(this.serviceName, this.showInHome);
        this.configProvider.set(opts);
    }
    revokeToken() {
        this.popupProvider
            .ionicConfirm('Coinbase', 'Are you sure you would like to log out of your Coinbase account?')
            .then(res => {
            if (res) {
                this.coinbaseProvider.logout();
                this.navCtrl.popToRoot();
            }
        });
    }
    goToCoinbase() {
        this.navCtrl.push(CoinbasePage, { animate: false }).then(() => {
            const previousView = this.navCtrl.getPrevious();
            this.navCtrl.removeView(previousView);
        });
    }
};
CoinbaseSettingsPage = __decorate([
    Component({
        selector: 'page-coinbase-settings',
        templateUrl: 'coinbase-settings.html'
    }),
    __metadata("design:paramtypes", [NavController,
        PopupProvider,
        CoinbaseProvider,
        ConfigProvider,
        HomeIntegrationsProvider])
], CoinbaseSettingsPage);
export { CoinbaseSettingsPage };
//# sourceMappingURL=coinbase-settings.js.map