import { __decorate, __metadata } from "tslib";
import { Directive, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';
// Provider
import { ConfigProvider } from '../../providers/config/config';
import { PopupProvider } from '../../providers/popup/popup';
let NoLowFee = class NoLowFee {
    constructor(configProvider, elem, logger, navCtrl, popupProvider) {
        this.configProvider = configProvider;
        this.elem = elem;
        this.logger = logger;
        this.navCtrl = navCtrl;
        this.popupProvider = popupProvider;
        this.logger.debug('NoLowFee Directive initialized');
        this.configWallet = this.configProvider.get().wallet;
    }
    noLowFee() {
        if (this.configWallet.settings.feeLevel &&
            this.configWallet.settings.feeLevel.match(/conomy/)) {
            this.logger.debug('Economy Fee setting... disabling link:' +
                this.elem.nativeElement.innerText);
            this.popupProvider
                .ionicAlert('Low Fee Error', 'Please change your Bitcoin Network Fee Policy setting to Normal or higher to use this service')
                .then(() => {
                this.navCtrl.pop();
            });
        }
    }
};
NoLowFee = __decorate([
    Directive({
        selector: '[no-low-fee]',
        host: {
            '(click)': 'noLowFee()'
        }
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        ElementRef,
        Logger,
        NavController,
        PopupProvider])
], NoLowFee);
export { NoLowFee };
//# sourceMappingURL=no-low-fee.js.map