import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
// native
import { Device } from '@ionic-native/device';
import { LaunchReview } from '@ionic-native/launch-review';
// providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { AppProvider } from '../../../providers/app/app';
import { ConfigProvider } from '../../../providers/config/config';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { FeedbackProvider } from '../../../providers/feedback/feedback';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { PlatformProvider } from '../../../providers/platform/platform';
import { PopupProvider } from '../../../providers/popup/popup';
// pages
import { FinishModalPage } from '../../finish/finish';
import { SharePage } from '../../settings/share/share';
let SendFeedbackPage = class SendFeedbackPage {
    constructor(actionSheetProvider, configProvider, externalLinkProvider, launchReview, modalCtrl, navCtrl, navParams, platformProvider, appProvider, onGoingProcessProvider, feedbackProvider, formBuilder, popupProvider, translate, device) {
        this.actionSheetProvider = actionSheetProvider;
        this.configProvider = configProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.launchReview = launchReview;
        this.modalCtrl = modalCtrl;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.platformProvider = platformProvider;
        this.appProvider = appProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.feedbackProvider = feedbackProvider;
        this.formBuilder = formBuilder;
        this.popupProvider = popupProvider;
        this.translate = translate;
        this.device = device;
        this.feedbackForm = this.formBuilder.group({
            comment: [
                '',
                Validators.compose([Validators.minLength(1), Validators.required])
            ]
        });
        this.fromCard = this.navParams.data.fromCard;
        this.score = this.navParams.data.score;
        this.appName = this.appProvider.info.nameCase;
        this.leavingFeedback = false;
        this.isCordova = this.platformProvider.isCordova;
        this.isAndroid = this.platformProvider.isAndroid;
    }
    ionViewWillEnter() {
        switch (this.score) {
            case 1:
                this.reaction = this.translate.instant('Ouch!');
                this.comment = this.translate.instant("There's obviously something we're doing wrong. How could we improve your experience?");
                break;
            case 2:
                this.reaction = this.translate.instant('How can we improve?');
                this.comment = this.translate.instant("We're always listening for ways we can improve your experience. Is there anything we could do to improve your experience?");
                break;
            case 3:
                this.reaction = this.translate.instant('Thanks!');
                this.comment = this.translate.instant("We're always listening for ways we can improve your experience. Feel free to leave us 5 star review in the app store or share with your friends!");
                break;
            default:
                this.reaction = this.translate.instant('Feedback!');
                this.comment = this.translate.instant("We're always listening for ways we can improve your experience. Feel free to leave us a review in the app store or request a new feature. Also, let us know if you experience any technical issues.");
                break;
        }
    }
    showAppreciationSheet() {
        const storeName = this.isAndroid ? 'Play Store' : 'App Store';
        const infoSheet = this.actionSheetProvider.createInfoSheet('appreciate-review', { storeName });
        infoSheet.present();
        infoSheet.onDidDismiss((option) => __awaiter(this, void 0, void 0, function* () {
            if (!option)
                return;
            if (this.launchReview.isRatingSupported()) {
                this.launchReview.rating();
            }
            else {
                yield this.launchReview.launch();
            }
        }));
    }
    leaveFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            this.leavingFeedback = this.leavingFeedback ? false : true;
            if (this.leavingFeedback) {
                yield Observable.timer(50).toPromise();
                this.feedbackTextarea.setFocus();
            }
        });
    }
    openExternalLink(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.externalLinkProvider.open(url);
        });
    }
    goHome() {
        this.navCtrl.popToRoot({ animate: false });
    }
    openSharePage() {
        this.navCtrl.push(SharePage);
    }
    sendFeedback(feedback, goHome) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = this.configProvider.get();
            let version;
            let platform;
            if (this.platformProvider.isElectron) {
                version = this.platformProvider
                    .getDeviceInfo()
                    .match(/(Electron[\/]\d+(\.\d)*)/i)[0]; // getDeviceInfo example: 5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Copay/5.1.0 Chrome/66.0.3359.181 Electron/3.0.8 Safari/537.36
                platform =
                    this.platformProvider.getOS() && this.platformProvider.getOS().OSName;
            }
            else {
                version = this.device.version || 'Unknown version';
                platform = this.device.platform || 'Unknown platform';
            }
            const dataSrc = {
                email: _.values(config.emailFor)[0] || ' ',
                feedback: goHome ? ' ' : feedback,
                score: this.score || ' ',
                appVersion: this.appProvider.info.version,
                platform,
                deviceVersion: version
            };
            if (!goHome)
                this.onGoingProcessProvider.set('sendingFeedback');
            this.feedbackProvider
                .send(dataSrc)
                .then(() => __awaiter(this, void 0, void 0, function* () {
                if (goHome)
                    return;
                this.onGoingProcessProvider.clear();
                const params = {
                    finishText: 'Thanks',
                    finishComment: 'A member of the team will review your feedback as soon as possible.'
                };
                const modal = this.modalCtrl.create(FinishModalPage, params, {
                    showBackdrop: true,
                    enableBackdropDismiss: false
                });
                yield modal.present();
                this.navCtrl.popToRoot({ animate: false });
            }))
                .catch(() => {
                if (goHome)
                    return;
                this.onGoingProcessProvider.clear();
                const title = this.translate.instant('Error');
                const subtitle = this.translate.instant('Feedback could not be submitted. Please try again later.');
                this.popupProvider.ionicAlert(title, subtitle);
            });
            if (goHome) {
                this.navCtrl.popToRoot({ animate: false });
            }
        });
    }
    showInfoSheet(key, externalLink) {
        const infoSheet = this.actionSheetProvider.createInfoSheet(key);
        infoSheet.present();
        infoSheet.onDidDismiss((option) => __awaiter(this, void 0, void 0, function* () {
            if (!option) {
                this.openExternalLink(externalLink);
            }
            else {
                // Click on Get Help
                this.openExternalLink('https://support.bitpay.com/hc/en-us');
            }
        }));
    }
};
__decorate([
    ViewChild('focusMe'),
    __metadata("design:type", Object)
], SendFeedbackPage.prototype, "feedbackTextarea", void 0);
SendFeedbackPage = __decorate([
    Component({
        selector: 'page-send-feedback',
        templateUrl: 'send-feedback.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        ConfigProvider,
        ExternalLinkProvider,
        LaunchReview,
        ModalController,
        NavController,
        NavParams,
        PlatformProvider,
        AppProvider,
        OnGoingProcessProvider,
        FeedbackProvider,
        FormBuilder,
        PopupProvider,
        TranslateService,
        Device])
], SendFeedbackPage);
export { SendFeedbackPage };
//# sourceMappingURL=send-feedback.js.map