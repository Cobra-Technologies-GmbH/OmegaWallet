import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController } from 'ionic-angular';
// pages
import { SendFeedbackPage } from '../../feedback/send-feedback/send-feedback';
import { SessionLogPage } from './session-log/session-log';
// providers
import { AppProvider, BitPayProvider, ExternalLinkProvider, Logger, PersistenceProvider, ReplaceParametersProvider } from '../../../providers';
let AboutPage = class AboutPage {
    constructor(navCtrl, appProvider, logger, externalLinkProvider, replaceParametersProvider, translate, bitpayProvider, persistenceProvider, events) {
        this.navCtrl = navCtrl;
        this.appProvider = appProvider;
        this.logger = logger;
        this.externalLinkProvider = externalLinkProvider;
        this.replaceParametersProvider = replaceParametersProvider;
        this.translate = translate;
        this.bitpayProvider = bitpayProvider;
        this.persistenceProvider = persistenceProvider;
        this.events = events;
        this.tapped = 0;
        this.releaseInfoTaps = 0;
        this.pressed = 0;
    }
    ionViewDidLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Loaded: AboutPage');
            this.commitHash = this.appProvider.info.commitHash;
            this.version = this.appProvider.info.version;
            this.releaseInfoTaps = 0;
            this.title = this.replaceParametersProvider.replace(this.translate.instant('About {{appName}}'), { appName: this.appProvider.info.nameCase });
            this.easterEggStatus = yield this.persistenceProvider.getTestingAdvertisments();
        });
    }
    openExternalLink() {
        const url = 'https://github.com/bitpay/' +
            this.appProvider.info.gitHubRepoName +
            '/tree/' +
            this.appProvider.info.commitHash +
            '';
        const optIn = true;
        const title = this.translate.instant('Open GitHub Project');
        const message = this.translate.instant('You can see the latest developments and contribute to this open source app by visiting our project on GitHub.');
        const okText = this.translate.instant('Open GitHub');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    countReleaseHeaderTaps() {
        return __awaiter(this, void 0, void 0, function* () {
            this.releaseInfoTaps++;
            if (this.releaseInfoTaps !== 12)
                return;
            this.releaseInfoTaps = 0;
            if (this.easterEggStatus === 'enabled') {
                this.easterEggStatus = undefined;
                this.persistenceProvider.removeTestingAdvertisments();
                this.events.publish('Local/TestAdsToggle', false);
            }
            else {
                this.easterEggStatus = 'enabled';
                this.persistenceProvider.setTestingAdvertisements('enabled');
                this.events.publish('Local/TestAdsToggle', true);
            }
        });
    }
    openSessionLog() {
        this.navCtrl.push(SessionLogPage);
    }
    openSendFeedbackPage() {
        this.navCtrl.push(SendFeedbackPage);
    }
    // adding this for testing purposes
    wipeBitPayAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tapped++;
            if (this.tapped >= 10) {
                yield this.persistenceProvider.removeAllBitPayAccounts(this.bitpayProvider.getEnvironment().network);
                alert('removed accounts');
                this.tapped = 0;
            }
        });
    }
};
AboutPage = __decorate([
    Component({
        selector: 'page-about',
        templateUrl: 'about.html'
    }),
    __metadata("design:paramtypes", [NavController,
        AppProvider,
        Logger,
        ExternalLinkProvider,
        ReplaceParametersProvider,
        TranslateService,
        BitPayProvider,
        PersistenceProvider,
        Events])
], AboutPage);
export { AboutPage };
//# sourceMappingURL=about.js.map