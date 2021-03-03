import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';
// Providers
import { TouchIdProvider } from '../../providers/touchid/touchid';
let FingerprintModalPage = class FingerprintModalPage {
    constructor(touchid, platform, viewCtrl) {
        this.touchid = touchid;
        this.platform = platform;
        this.viewCtrl = viewCtrl;
        this.unregister = this.platform.registerBackButtonAction(() => { });
        this.checkFingerprint();
    }
    checkFingerprint() {
        this.touchid.check().then(() => {
            this.unregister();
            this.viewCtrl.dismiss();
        });
    }
};
FingerprintModalPage = __decorate([
    Component({
        selector: 'page-fingerprint',
        templateUrl: 'fingerprint.html'
    }),
    __metadata("design:paramtypes", [TouchIdProvider,
        Platform,
        ViewController])
], FingerprintModalPage);
export { FingerprintModalPage };
//# sourceMappingURL=fingerprint.js.map