import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';
let PopupProvider = class PopupProvider {
    constructor(alertCtrl, logger, translate) {
        this.alertCtrl = alertCtrl;
        this.logger = logger;
        this.translate = translate;
    }
    ionicAlert(title, subTitle, okText) {
        return new Promise(resolve => {
            let alert = this.alertCtrl.create({
                title,
                subTitle,
                enableBackdropDismiss: false,
                buttons: [
                    {
                        text: okText ? okText : this.translate.instant('Ok'),
                        handler: () => {
                            this.logger.info('Ok clicked');
                            resolve();
                        }
                    }
                ],
                cssClass: 'alertTheme'
            });
            alert.present();
        });
    }
    ionicConfirm(title, message, okText, cancelText) {
        return new Promise(resolve => {
            let confirm = this.alertCtrl.create({
                title,
                message,
                buttons: [
                    {
                        text: cancelText ? cancelText : this.translate.instant('Cancel'),
                        handler: () => {
                            this.logger.info('Disagree clicked');
                            resolve(false);
                        }
                    },
                    {
                        text: okText ? okText : this.translate.instant('Ok'),
                        handler: () => {
                            this.logger.info('Agree clicked');
                            resolve(true);
                        }
                    }
                ],
                enableBackdropDismiss: false,
                cssClass: 'alertTheme'
            });
            confirm.present();
        });
    }
    ionicPrompt(title, message, opts, okText, cancelText) {
        return new Promise(resolve => {
            let defaultText = opts && opts.defaultText ? opts.defaultText : null;
            let placeholder = opts && opts.placeholder ? opts.placeholder : null;
            let inputType = opts && opts.type ? opts.type : 'text';
            let cssClass = opts && opts.useDanger ? 'alertDanger' : null;
            let enableBackdropDismiss = !!(opts && opts.enableBackdropDismiss);
            let prompt = this.alertCtrl.create({
                title,
                message,
                cssClass,
                enableBackdropDismiss,
                inputs: [
                    {
                        value: defaultText,
                        placeholder,
                        type: inputType
                    }
                ],
                buttons: [
                    {
                        text: cancelText ? cancelText : this.translate.instant('Cancel'),
                        handler: () => {
                            this.logger.info('Cancel clicked');
                            resolve(null);
                        }
                    },
                    {
                        text: okText ? okText : this.translate.instant('Ok'),
                        handler: data => {
                            this.logger.info('Saved clicked');
                            resolve(data[0]);
                        }
                    }
                ]
            });
            prompt.present();
        });
    }
};
PopupProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AlertController,
        Logger,
        TranslateService])
], PopupProvider);
export { PopupProvider };
//# sourceMappingURL=popup.js.map