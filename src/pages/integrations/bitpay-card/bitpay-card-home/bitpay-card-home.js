import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { Events, NavController } from 'ionic-angular';
// Providers
import { AppProvider, IABCardProvider } from '../../../../providers';
// Pages
import { animate, style, transition, trigger } from '@angular/animations';
import { Network, PersistenceProvider } from '../../../../providers/persistence/persistence';
import { BitPayCardIntroPage } from '../bitpay-card-intro/bitpay-card-intro';
import { PhaseOneCardIntro } from '../bitpay-card-phases/phase-one/phase-one-intro-page/phase-one-intro-page';
let BitPayCardHome = class BitPayCardHome {
    constructor(appProvider, navCtrl, iabCardProvider, persistenceProvider, events) {
        this.appProvider = appProvider;
        this.navCtrl = navCtrl;
        this.iabCardProvider = iabCardProvider;
        this.persistenceProvider = persistenceProvider;
        this.events = events;
        this.disableAddCard = true;
        this.persistenceProvider.getWaitingListStatus().then(status => {
            this.alreadyOnWaitList = !!status;
        });
        this.events.subscribe('reachedCardLimit', () => {
            this.disableAddCard = true;
        });
    }
    ngOnInit() {
        this.appName = this.appProvider.info.userVisibleName;
        this.disableAddCard =
            this.bitpayCardItems &&
                this.bitpayCardItems.find(c => c.provider === 'galileo');
    }
    goToBitPayCardIntroPage() {
        this.navCtrl.push(this.waitList ? PhaseOneCardIntro : BitPayCardIntroPage);
    }
    trackBy(index) {
        return index;
    }
    goToCard(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.iabCardProvider.loadingWrapper(() => __awaiter(this, void 0, void 0, function* () {
                const token = yield this.persistenceProvider.getBitPayIdPairingToken(this.network);
                const email = this.bitpayCardItems[0].email;
                const message = !token
                    ? `loadDashboard?${cardId}&${email}`
                    : `loadDashboard?${cardId}`;
                this.iabCardProvider.show();
                setTimeout(() => {
                    this.iabCardProvider.sendMessage({
                        message
                    }, () => { });
                });
            }));
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], BitPayCardHome.prototype, "showBitpayCardGetStarted", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], BitPayCardHome.prototype, "bitpayCardItems", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], BitPayCardHome.prototype, "cardExperimentEnabled", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], BitPayCardHome.prototype, "waitList", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], BitPayCardHome.prototype, "hasCards", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], BitPayCardHome.prototype, "network", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], BitPayCardHome.prototype, "initialized", void 0);
BitPayCardHome = __decorate([
    Component({
        selector: 'bitpay-card-home',
        templateUrl: 'bitpay-card-home.html',
        animations: [
            trigger('fadeUp', [
                transition(':enter', [
                    style({
                        transform: 'translateY(5px)',
                        opacity: 0
                    }),
                    animate('300ms')
                ])
            ]),
            trigger('fade', [
                transition(':enter', [
                    style({
                        opacity: 0
                    }),
                    animate('300ms')
                ])
            ]),
            trigger('tileSlideIn', [
                transition(':enter', [
                    style({
                        transform: 'translateX(10px)',
                        opacity: 0
                    }),
                    animate('300ms ease')
                ])
            ])
        ]
    }),
    __metadata("design:paramtypes", [AppProvider,
        NavController,
        IABCardProvider,
        PersistenceProvider,
        Events])
], BitPayCardHome);
export { BitPayCardHome };
//# sourceMappingURL=bitpay-card-home.js.map