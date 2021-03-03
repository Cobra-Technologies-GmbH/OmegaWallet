import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
// Proviers
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { Logger } from '../../../../providers/logger/logger';
import { ThemeProvider } from '../../../../providers/theme/theme';
let ChangellyTermsPage = class ChangellyTermsPage {
    constructor(logger, externalLinkProvider, viewCtrl, themeProvider) {
        this.logger = logger;
        this.externalLinkProvider = externalLinkProvider;
        this.viewCtrl = viewCtrl;
        this.themeProvider = themeProvider;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: ChangellyTermsPage');
    }
    close() {
        this.viewCtrl.dismiss();
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
};
ChangellyTermsPage = __decorate([
    Component({
        selector: 'page-changelly-terms',
        templateUrl: 'changelly-terms.html'
    }),
    __metadata("design:paramtypes", [Logger,
        ExternalLinkProvider,
        ViewController,
        ThemeProvider])
], ChangellyTermsPage);
export { ChangellyTermsPage };
//# sourceMappingURL=changelly-terms.js.map