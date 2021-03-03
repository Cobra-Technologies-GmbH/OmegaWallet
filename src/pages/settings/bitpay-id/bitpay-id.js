import { __awaiter, __decorate, __metadata } from "tslib";
import { ChangeDetectorRef, Component } from '@angular/core';
// providers
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import { ActionSheetProvider, BitPayIdProvider, Logger, PersistenceProvider, PopupProvider } from '../../../providers';
import { InAppBrowserProvider } from '../../../providers/in-app-browser/in-app-browser';
let BitPayIdPage = class BitPayIdPage {
    constructor(events, logger, navParams, bitPayIdProvider, navCtrl, popupProvider, persistenceProvider, actionSheetProvider, changeDetectorRef, translate, iab) {
        this.events = events;
        this.logger = logger;
        this.navParams = navParams;
        this.bitPayIdProvider = bitPayIdProvider;
        this.navCtrl = navCtrl;
        this.popupProvider = popupProvider;
        this.persistenceProvider = persistenceProvider;
        this.actionSheetProvider = actionSheetProvider;
        this.changeDetectorRef = changeDetectorRef;
        this.translate = translate;
        this.iab = iab;
        this.bitpayIdSettings = this.getDefaultBitPayIdSettings();
    }
    ionViewDidLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this.userBasicInfo = this.navParams.data;
            this.changeDetectorRef.detectChanges();
            this.network = this.bitPayIdProvider.getEnvironment().network;
            this.bitpayIdSettings =
                (yield this.persistenceProvider.getBitPayIdSettings(this.network)) ||
                    this.getDefaultBitPayIdSettings();
            this.originalBitpayIdSettings = JSON.stringify(this.bitpayIdSettings);
            this.logger.info('Loaded: BitPayID page');
        });
    }
    ionViewWillLeave() {
        const settingsChanged = this.originalBitpayIdSettings !== JSON.stringify(this.bitpayIdSettings);
        if (settingsChanged) {
            this.events.publish('BitPayId/SettingsChanged');
        }
    }
    getDefaultBitPayIdSettings() {
        return {
            syncGiftCardPurchases: false
        };
    }
    onSettingsChange() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.persistenceProvider.setBitPayIdSettings(this.network, this.bitpayIdSettings);
        });
    }
    disconnectBitPayID() {
        this.popupProvider
            .ionicConfirm(this.translate.instant('Disconnect Omega ID'), this.translate.instant('Are you sure you would like to disconnect your Omega ID?'))
            .then(res => {
            if (res) {
                this.bitPayIdProvider.disconnectBitPayID(() => {
                    const infoSheet = this.actionSheetProvider.createInfoSheet('in-app-notification', {
                        title: 'Omega ID',
                        body: this.translate.instant('Omega ID successfully disconnected.')
                    });
                    this.iab.refs.card.executeScript({
                        code: `window.postMessage(${JSON.stringify({
                            message: 'bitPayIdDisconnected'
                        })}, '*')`
                    }, () => {
                        infoSheet.present();
                        setTimeout(() => {
                            this.navCtrl.popToRoot();
                        }, 400);
                    });
                    this.events.publish('BitPayId/Disconnected');
                    this.events.publish('CardAdvertisementUpdate', {
                        status: 'disconnected'
                    });
                }, err => {
                    this.logger.log(err);
                });
            }
        });
    }
};
BitPayIdPage = __decorate([
    Component({
        selector: 'bitpay-id',
        templateUrl: 'bitpay-id.html'
    }),
    __metadata("design:paramtypes", [Events,
        Logger,
        NavParams,
        BitPayIdProvider,
        NavController,
        PopupProvider,
        PersistenceProvider,
        ActionSheetProvider,
        ChangeDetectorRef,
        TranslateService,
        InAppBrowserProvider])
], BitPayIdPage);
export { BitPayIdPage };
//# sourceMappingURL=bitpay-id.js.map