import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import { ActionSheetProvider } from '../../providers/action-sheet/action-sheet';
import { Logger } from '../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
let InAppBrowserProvider = class InAppBrowserProvider {
    constructor(logger, actionSheetProvider, translate, events, onGoingProcess) {
        this.logger = logger;
        this.actionSheetProvider = actionSheetProvider;
        this.translate = translate;
        this.events = events;
        this.onGoingProcess = onGoingProcess;
        // add new refs here
        this.refs = {};
        this.logger.debug('InAppBrowserProvider initialized');
    }
    sendMessageToIAB(ref, message, cb) {
        ref.executeScript({
            code: `window.postMessage(${JSON.stringify(Object.assign({}, message))}, '*')`
        }, cb);
    }
    createIABInstance(refName, config, url, initScript) {
        return new Promise((res, rej) => {
            const ref = cordova.InAppBrowser.open(url, '_blank', config);
            const initCb = () => {
                if (initScript) {
                    // script that executes inside of inappbrowser when loaded
                    ref.executeScript({
                        code: initScript
                    }, () => {
                        ref.removeEventListener('loadstop', initCb);
                        this.logger.debug(`InAppBrowserProvider -> ${refName} executed init script`);
                    });
                }
            };
            ref.addEventListener('loadstop', initCb);
            ref.addEventListener('loaderror', err => {
                this.logger.debug(`InAppBrowserProvider -> ${refName} ${JSON.stringify(err)} load error`);
                ref.error = true;
                ref.show = () => {
                    this.actionSheetProvider
                        .createInfoSheet('default-error', {
                        msg: this.translate.instant('Uh oh something went wrong! Please try again later.'),
                        title: this.translate.instant('Error')
                    })
                        .present();
                };
                this.onGoingProcess.clear();
                rej();
            });
            ref.events$ = new Subject();
            ref.addEventListener('message', e => ref.events$.next(e));
            this.events.subscribe('iab_message_update', e => ref.events$.next(e));
            // providing two ways to get ref - caching it here and also returning it
            this.refs[refName] = ref;
            res(ref);
        });
    }
};
InAppBrowserProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        ActionSheetProvider,
        TranslateService,
        Events,
        OnGoingProcessProvider])
], InAppBrowserProvider);
export { InAppBrowserProvider };
//# sourceMappingURL=in-app-browser.js.map