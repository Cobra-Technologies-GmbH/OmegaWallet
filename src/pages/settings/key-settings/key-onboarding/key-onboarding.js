import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { Slides, ViewController } from 'ionic-angular';
let KeyOnboardingPage = class KeyOnboardingPage {
    constructor(viewCtrl) {
        this.viewCtrl = viewCtrl;
    }
    ionViewWillLoad() {
        this.walletGroupOnboardingSlides.lockSwipeToPrev(true);
    }
    slideChanged() {
        // Disable first and last slides bounce
        let currentIndex = this.walletGroupOnboardingSlides.getActiveIndex();
        if (currentIndex == 0)
            this.walletGroupOnboardingSlides.lockSwipeToPrev(true);
        if (currentIndex > 0)
            this.walletGroupOnboardingSlides.lockSwipeToPrev(false);
        if (currentIndex >= 2)
            this.walletGroupOnboardingSlides.lockSwipeToNext(true);
        if (currentIndex < 2)
            this.walletGroupOnboardingSlides.lockSwipeToNext(false);
    }
    nextSlide() {
        this.walletGroupOnboardingSlides.slideNext();
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
__decorate([
    ViewChild('walletGroupOnboardingSlides'),
    __metadata("design:type", Slides)
], KeyOnboardingPage.prototype, "walletGroupOnboardingSlides", void 0);
KeyOnboardingPage = __decorate([
    Component({
        selector: 'page-key-onboarding',
        templateUrl: 'key-onboarding.html'
    }),
    __metadata("design:paramtypes", [ViewController])
], KeyOnboardingPage);
export { KeyOnboardingPage };
//# sourceMappingURL=key-onboarding.js.map