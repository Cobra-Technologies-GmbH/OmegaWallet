import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
let AdvertisingComponent = class AdvertisingComponent {
    constructor(externalLinkProvider, viewCtrl, navParams) {
        this.externalLinkProvider = externalLinkProvider;
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.advertising = this.navParams.data.advertising;
    }
    close() {
        this.viewCtrl.dismiss();
    }
    openInBrowser() {
        this.externalLinkProvider.open(this.advertising.takeover_url);
        this.close();
    }
};
AdvertisingComponent = __decorate([
    Component({
        selector: 'advertising',
        templateUrl: 'advertising.html'
    }),
    __metadata("design:paramtypes", [ExternalLinkProvider,
        ViewController,
        NavParams])
], AdvertisingComponent);
export { AdvertisingComponent };
//# sourceMappingURL=advertising.js.map