import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavParams, ViewController } from 'ionic-angular';
// Providers
import { ChangellyProvider } from '../../../../providers/changelly/changelly';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { Logger } from '../../../../providers/logger/logger';
import { PopupProvider } from '../../../../providers/popup/popup';
let ChangellyDetailsPage = class ChangellyDetailsPage {
    constructor(externalLinkProvider, logger, navParams, popupProvider, changellyProvider, translate, viewCtrl) {
        this.externalLinkProvider = externalLinkProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.popupProvider = popupProvider;
        this.changellyProvider = changellyProvider;
        this.translate = translate;
        this.viewCtrl = viewCtrl;
        this.swapTxData = this.navParams.data.swapTxData;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: ChangellyDetailsPage');
    }
    ionViewWillEnter() {
        this.updateStatusDescription();
        this.getStatus();
    }
    updateStatusDescription() {
        this.status = this.changellyProvider.getStatusDetails(this.swapTxData.status);
    }
    doRefresh(refresher) {
        this.logger.info('Forcing status query');
        this.getStatus(true);
        setTimeout(() => {
            refresher.complete();
        }, 2000);
    }
    getStatus(force) {
        if (this.swapTxData.status == 'finished' && !force)
            return;
        this.changellyProvider
            .getStatus(this.swapTxData.exchangeTxId, this.swapTxData.status)
            .then(data => {
            if (data.error) {
                this.logger.error('Changelly getStatus Error: ' + data.error.message);
                return;
            }
            if (data.result != this.swapTxData.status) {
                this.logger.debug('Updating status to: ' + data.result);
                this.swapTxData.status = data.result;
                this.updateStatusDescription();
                this.changellyProvider.saveChangelly(this.swapTxData, {
                    status: data.result
                });
            }
        })
            .catch(err => {
            this.logger.error('Changelly getStatus Error: ', err);
        });
    }
    remove() {
        const title = this.translate.instant('Removing Transaction Data');
        const message = this.translate.instant("The data of this exchange will be deleted from your device. Make sure you don't need it");
        const okText = this.translate.instant('Remove');
        const cancelText = this.translate.instant('Cancel');
        this.popupProvider
            .ionicConfirm(title, message, okText, cancelText)
            .then((res) => {
            if (res) {
                this.changellyProvider
                    .saveChangelly(this.swapTxData, {
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
ChangellyDetailsPage = __decorate([
    Component({
        selector: 'page-changelly-details',
        templateUrl: 'changelly-details.html'
    }),
    __metadata("design:paramtypes", [ExternalLinkProvider,
        Logger,
        NavParams,
        PopupProvider,
        ChangellyProvider,
        TranslateService,
        ViewController])
], ChangellyDetailsPage);
export { ChangellyDetailsPage };
//# sourceMappingURL=changelly-details.js.map