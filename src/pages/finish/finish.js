import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavParams, ViewController } from 'ionic-angular';
let FinishModalPage = class FinishModalPage {
    constructor(viewCtrl, navParams, translate) {
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.translate = translate;
        this.finishText =
            this.navParams.data.finishText || this.navParams.data.finishText == ''
                ? this.navParams.data.finishText
                : this.translate.instant('Payment Sent');
        this.finishComment = this.navParams.data.finishComment
            ? this.navParams.data.finishComment
            : '';
        this.cssClass = this.navParams.data.cssClass
            ? this.navParams.data.cssClass
            : 'success';
        if (this.navParams.get('autoDismiss')) {
            setTimeout(() => {
                this.viewCtrl.dismiss();
            }, 4000);
        }
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
FinishModalPage = __decorate([
    Component({
        selector: 'page-finish',
        templateUrl: 'finish.html'
    }),
    __metadata("design:paramtypes", [ViewController,
        NavParams,
        TranslateService])
], FinishModalPage);
export { FinishModalPage };
//# sourceMappingURL=finish.js.map