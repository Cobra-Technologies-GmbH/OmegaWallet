import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavParams, ViewController } from 'ionic-angular';
// Providers
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { Logger } from '../../../../providers/logger/logger';
import { PopupProvider } from '../../../../providers/popup/popup';
import { ThemeProvider } from '../../../../providers/theme/theme';
import { WyreProvider } from '../../../../providers/wyre/wyre';
let WyreDetailsPage = class WyreDetailsPage {
    constructor(externalLinkProvider, logger, navParams, popupProvider, wyreProvider, translate, viewCtrl, themeProvider) {
        this.externalLinkProvider = externalLinkProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.popupProvider = popupProvider;
        this.wyreProvider = wyreProvider;
        this.translate = translate;
        this.viewCtrl = viewCtrl;
        this.themeProvider = themeProvider;
        this.paymentRequest = this.navParams.data.paymentRequestData;
        this.paymentRequest.fiatBaseAmount =
            +this.paymentRequest.sourceAmount - +this.paymentRequest.fee;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: WyreDetailsPage');
    }
    ionViewWillEnter() {
        if (this.paymentRequest.status != 'success' &&
            this.paymentRequest.transferId) {
            this.logger.info('Wyre Details: trying to get transaction info');
            this.wyreProvider
                .getTransfer(this.navParams.data.transferId)
                .then((transferData) => {
                this.paymentRequest.status = 'success';
                this.paymentRequest.sourceAmount = transferData.sourceAmount;
                this.paymentRequest.fee = transferData.fee; // Total fee (crypto fee + Wyre fee)
                this.paymentRequest.destCurrency = transferData.destCurrency;
                this.paymentRequest.sourceCurrency = transferData.sourceCurrency;
                this.wyreProvider
                    .saveWyre(this.paymentRequest, null)
                    .then(() => {
                    this.logger.debug('Saved Wyre with transferId: ' + this.navParams.data.transferId);
                })
                    .catch(() => {
                    this.logger.warn('Could not update payment request status');
                });
            })
                .catch(_err => {
                this.logger.warn('Could not get transfer for transferId: ' +
                    this.navParams.data.transferId);
            });
        }
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
                this.wyreProvider
                    .saveWyre(this.paymentRequest, {
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
WyreDetailsPage = __decorate([
    Component({
        selector: 'page-wyre-details',
        templateUrl: 'wyre-details.html'
    }),
    __metadata("design:paramtypes", [ExternalLinkProvider,
        Logger,
        NavParams,
        PopupProvider,
        WyreProvider,
        TranslateService,
        ViewController,
        ThemeProvider])
], WyreDetailsPage);
export { WyreDetailsPage };
//# sourceMappingURL=wyre-details.js.map