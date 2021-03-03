import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavParams, ViewController } from 'ionic-angular';
// Providers
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { Logger } from '../../../../providers/logger/logger';
import { PopupProvider } from '../../../../providers/popup/popup';
import { SimplexProvider } from '../../../../providers/simplex/simplex';
let SimplexDetailsPage = class SimplexDetailsPage {
    constructor(externalLinkProvider, logger, navParams, popupProvider, simplexProvider, translate, viewCtrl) {
        this.externalLinkProvider = externalLinkProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.popupProvider = popupProvider;
        this.simplexProvider = simplexProvider;
        this.translate = translate;
        this.viewCtrl = viewCtrl;
        this.paymentRequest = this.navParams.data.paymentRequestData;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: SimplexDetailsPage');
    }
    remove() {
        const title = this.translate.instant('Removing Payment Request Data');
        const message = this.translate.instant("The data of this payment request will be deleted. Make sure you don't need it");
        const okText = this.translate.instant('Remove');
        const cancelText = this.translate.instant('Cancel');
        this.popupProvider
            .ionicConfirm(title, message, okText, cancelText)
            .then((res) => {
            if (res) {
                this.simplexProvider
                    .saveSimplex(this.paymentRequest, {
                    remove: true
                })
                    .then(() => {
                    this.close();
                });
            }
        });
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
SimplexDetailsPage = __decorate([
    Component({
        selector: 'page-simplex-details',
        templateUrl: 'simplex-details.html'
    }),
    __metadata("design:paramtypes", [ExternalLinkProvider,
        Logger,
        NavParams,
        PopupProvider,
        SimplexProvider,
        TranslateService,
        ViewController])
], SimplexDetailsPage);
export { SimplexDetailsPage };
//# sourceMappingURL=simplex-details.js.map