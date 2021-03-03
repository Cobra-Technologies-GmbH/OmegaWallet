import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
// Pages
import { ChangellyDetailsPage } from './changelly-details/changelly-details';
// Proviers
import { ChangellyProvider } from '../../../providers/changelly/changelly';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { Logger } from '../../../providers/logger/logger';
import { ThemeProvider } from '../../../providers/theme/theme';
let ChangellyPage = class ChangellyPage {
    constructor(logger, externalLinkProvider, modalCtrl, changellyProvider, themeProvider) {
        this.logger = logger;
        this.externalLinkProvider = externalLinkProvider;
        this.modalCtrl = modalCtrl;
        this.changellyProvider = changellyProvider;
        this.themeProvider = themeProvider;
    }
    ionViewDidLoad() {
        this.swapTxs = [];
        this.logger.info('Loaded: ChangellyPage');
    }
    ionViewWillEnter() {
        this.init();
    }
    init() {
        this.loading = true;
        this.changellyProvider
            .getChangelly()
            .then(changellyData => {
            const swapTxs = {};
            Object.assign(swapTxs, changellyData);
            this.swapTxs = Object.values(swapTxs);
            this.loading = false;
        })
            .catch(err => {
            this.loading = false;
            if (err)
                this.logger.error(err);
        });
    }
    openChangellyModal(swapTxData) {
        const modal = this.modalCtrl.create(ChangellyDetailsPage, {
            swapTxData
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
ChangellyPage = __decorate([
    Component({
        selector: 'page-changelly',
        templateUrl: 'changelly.html'
    }),
    __metadata("design:paramtypes", [Logger,
        ExternalLinkProvider,
        ModalController,
        ChangellyProvider,
        ThemeProvider])
], ChangellyPage);
export { ChangellyPage };
//# sourceMappingURL=changelly.js.map