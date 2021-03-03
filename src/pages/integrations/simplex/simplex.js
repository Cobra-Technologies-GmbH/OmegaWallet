import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ModalController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// Pages
import { SimplexDetailsPage } from './simplex-details/simplex-details';
// Proviers
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { Logger } from '../../../providers/logger/logger';
import { SimplexProvider } from '../../../providers/simplex/simplex';
import { ThemeProvider } from '../../../providers/theme/theme';
let SimplexPage = class SimplexPage {
    constructor(logger, externalLinkProvider, modalCtrl, navParams, simplexProvider, themeProvider) {
        this.logger = logger;
        this.externalLinkProvider = externalLinkProvider;
        this.modalCtrl = modalCtrl;
        this.navParams = navParams;
        this.simplexProvider = simplexProvider;
        this.themeProvider = themeProvider;
    }
    ionViewDidLoad() {
        this.paymentRequests = [];
        this.logger.info('Loaded: SimplexPage');
    }
    ionViewWillEnter() {
        this.init();
    }
    init() {
        this.loading = true;
        this.simplexProvider
            .getSimplex()
            .then(simplexData => {
            if (!_.isEmpty(this.navParams.data) &&
                this.navParams.data.paymentId &&
                simplexData[this.navParams.data.paymentId]) {
                simplexData[this.navParams.data.paymentId].status =
                    this.navParams.data.success === 'true' ? 'success' : 'failed';
                this.simplexProvider
                    .saveSimplex(simplexData[this.navParams.data.paymentId], null)
                    .catch(() => {
                    this.logger.warn('Could not update payment request status');
                });
            }
            const paymentRequests = {};
            Object.assign(paymentRequests, simplexData);
            this.paymentRequests = Object.values(paymentRequests);
            this.loading = false;
        })
            .catch(err => {
            this.loading = false;
            if (err)
                this.logger.error(err);
        });
    }
    openSimplexModal(paymentRequestData) {
        const modal = this.modalCtrl.create(SimplexDetailsPage, {
            paymentRequestData
        });
        modal.present();
        modal.onDidDismiss(() => {
            this.init();
        });
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
};
SimplexPage = __decorate([
    Component({
        selector: 'page-simplex',
        templateUrl: 'simplex.html'
    }),
    __metadata("design:paramtypes", [Logger,
        ExternalLinkProvider,
        ModalController,
        NavParams,
        SimplexProvider,
        ThemeProvider])
], SimplexPage);
export { SimplexPage };
//# sourceMappingURL=simplex.js.map