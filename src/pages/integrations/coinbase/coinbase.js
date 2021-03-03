import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
// Providers
import { CoinbaseProvider } from '../../../providers/coinbase/coinbase';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { PlatformProvider } from '../../../providers/platform/platform';
import { PopupProvider } from '../../../providers/popup/popup';
let CoinbasePage = class CoinbasePage {
    constructor(coinbaseProvider, popupProvider, navCtrl, externalLinkProvider, platformProvider, onGoingProcessProvider, navParams, translate, formBuilder, viewCtrl) {
        this.coinbaseProvider = coinbaseProvider;
        this.popupProvider = popupProvider;
        this.navCtrl = navCtrl;
        this.externalLinkProvider = externalLinkProvider;
        this.platformProvider = platformProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.navParams = navParams;
        this.translate = translate;
        this.formBuilder = formBuilder;
        this.viewCtrl = viewCtrl;
        this.pendingTransactions = { data: {} };
        this.oauthCodeForm = this.formBuilder.group({
            code: [
                '',
                Validators.compose([Validators.minLength(1), Validators.required])
            ]
        });
        this.isElectron = this.platformProvider.isElectron;
        this.showOauthForm = false;
    }
    ionViewWillEnter() {
        this.hasCredentials = !!this.coinbaseProvider.oauthUrl;
        if (!this.hasCredentials)
            return;
        if (this.navParams.data.code) {
            this.submitOauthCode(this.navParams.data.code);
        }
        else if (this.coinbaseProvider.isLinked()) {
            this.backToWalletTabs();
        }
    }
    backToWalletTabs() {
        setTimeout(() => {
            this.navCtrl.popToRoot().then(_ => {
                this.navCtrl.parent.select(1);
            });
        }, 600);
    }
    openAuthenticateWindow() {
        this.showOauthForm = true;
        if (!this.isElectron) {
            if (this.navParams.data.isOnboardingFlow) {
                this.navCtrl.remove(this.viewCtrl.index - 1).then(() => {
                    this.viewCtrl.dismiss();
                });
            }
            this.externalLinkProvider.open(this.coinbaseProvider.oauthUrl);
        }
        else {
            const { remote } = window.require('electron');
            const BrowserWindow = remote.BrowserWindow;
            const win = new BrowserWindow({
                alwaysOnTop: true,
                center: true,
                webPreferences: {
                    contextIsolation: false,
                    nodeIntegration: false,
                    worldSafeExecuteJavaScript: true
                }
            });
            win.once('ready-to-show', () => {
                win.show();
                win.focus();
            });
            win.loadURL(this.coinbaseProvider.oauthUrl);
            win.webContents.on('did-finish-load', () => {
                const title = win.webContents.getTitle();
                if (title.indexOf('Coinbase') == -1) {
                    this.submitOauthCode(title);
                    win.close();
                }
            });
        }
    }
    submitOauthCode(code) {
        this.onGoingProcessProvider.set('connectingCoinbase');
        this.coinbaseProvider
            .linkAccount(code)
            .then(_ => {
            this.onGoingProcessProvider.clear();
            this.backToWalletTabs();
        })
            .catch(e => {
            this.onGoingProcessProvider.clear();
            this.popupProvider.ionicAlert(this.translate.instant('Error connecting to Coinbase'), e);
            if (!this.isElectron) {
                let previousView = this.navCtrl.getPrevious();
                this.navCtrl.removeView(previousView);
            }
        });
    }
    openSignupWindow() {
        let url = this.coinbaseProvider.signupUrl;
        let optIn = true;
        let title = this.translate.instant('Sign Up for Coinbase');
        let message = this.translate.instant('This will open Coinbase.com, where you can create an account.');
        let okText = this.translate.instant('Go to Coinbase');
        let cancelText = this.translate.instant('Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    openSupportWindow() {
        let url = this.coinbaseProvider.supportUrl;
        let optIn = true;
        let title = this.translate.instant('Coinbase Support');
        let message = this.translate.instant('You can email support@coinbase.com for direct support, or you can view their help center.');
        let okText = this.translate.instant('Open Help Center');
        let cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
};
CoinbasePage = __decorate([
    Component({
        selector: 'page-coinbase',
        templateUrl: 'coinbase.html'
    }),
    __metadata("design:paramtypes", [CoinbaseProvider,
        PopupProvider,
        NavController,
        ExternalLinkProvider,
        PlatformProvider,
        OnGoingProcessProvider,
        NavParams,
        TranslateService,
        FormBuilder,
        ViewController])
], CoinbasePage);
export { CoinbasePage };
//# sourceMappingURL=coinbase.js.map