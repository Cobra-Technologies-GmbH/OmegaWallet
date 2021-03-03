import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// providers
import { Events } from 'ionic-angular';
import 'rxjs/add/observable/fromEvent';
import { Observable } from 'rxjs/Observable';
import { ElectronProvider } from '../electron/electron';
import { PlatformProvider } from '../platform/platform';
import { PopupProvider } from '../popup/popup';
let ExternalLinkProvider = class ExternalLinkProvider {
    constructor(popupProvider, logger, platformProvider, electronProvider, events) {
        this.popupProvider = popupProvider;
        this.logger = logger;
        this.platformProvider = platformProvider;
        this.electronProvider = electronProvider;
        this.events = events;
        this.logger.debug('ExternalLinkProvider initialized');
    }
    restoreHandleOpenURL(old) {
        setTimeout(() => {
            window.handleOpenURL = old;
        }, 500);
    }
    open(url, optIn, title, message, okText, cancelText) {
        return new Promise(resolve => {
            if (optIn) {
                this.popupProvider
                    .ionicConfirm(title, message, okText, cancelText)
                    .then((res) => {
                    this.openBrowser(res, url);
                    resolve();
                });
            }
            else {
                this.openBrowser(true, url);
                resolve();
            }
        });
    }
    openBrowser(res, url) {
        let old = window.handleOpenURL;
        // Ignore external URLs: avoid opening action sheet
        window.handleOpenURL = url => {
            this.logger.debug('Skip: ' + url);
        };
        if (res) {
            if (this.platformProvider.isElectron) {
                this.electronProvider.openExternalLink(url);
            }
            else {
                // workaround for an existing cordova inappbrowser plugin issue - redirecting events back to the iab ref
                const w = cordova.InAppBrowser.open(url, '_system');
                Observable.fromEvent(w, 'message').subscribe(e => this.events.publish('iab_message_update', e));
            }
        }
        this.restoreHandleOpenURL(old);
    }
};
ExternalLinkProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PopupProvider,
        Logger,
        PlatformProvider,
        ElectronProvider,
        Events])
], ExternalLinkProvider);
export { ExternalLinkProvider };
//# sourceMappingURL=external-link.js.map