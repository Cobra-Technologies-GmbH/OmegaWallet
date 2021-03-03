import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';
import { TimeProvider } from '../../../providers/time/time';
import { TxpDetailsPage } from '../../txp-details/txp-details';
import { ConfirmPage } from '../../send/confirm/confirm';
let TxpPage = class TxpPage {
    constructor(timeProvider, modalCtrl, navCtrl) {
        this.timeProvider = timeProvider;
        this.modalCtrl = modalCtrl;
        this.navCtrl = navCtrl;
    }
    set tx(tx) {
        this._tx = tx;
    }
    get tx() {
        return this._tx;
    }
    set addressbook(addressbook) {
        this._addressbook = addressbook;
    }
    get addressbook() {
        return this._addressbook;
    }
    set noOpenModal(noOpenModal) {
        this._noOpenModal = noOpenModal;
    }
    get noOpenModal() {
        return this._noOpenModal;
    }
    createdWithinPastDay(time) {
        return this.timeProvider.withinPastDay(time);
    }
    openTxpModal(txp) {
        if (this._noOpenModal)
            return;
        const modal = this.modalCtrl.create(TxpDetailsPage, { tx: txp }, { showBackdrop: false, enableBackdropDismiss: false });
        modal.present();
        modal.onDidDismiss(opts => {
            if (opts && opts.multisigContractAddress) {
                this.navCtrl.push(ConfirmPage, opts);
            }
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], TxpPage.prototype, "tx", null);
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], TxpPage.prototype, "addressbook", null);
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], TxpPage.prototype, "noOpenModal", null);
TxpPage = __decorate([
    Component({
        selector: 'page-txp',
        templateUrl: 'txp.html'
    }),
    __metadata("design:paramtypes", [TimeProvider,
        ModalController,
        NavController])
], TxpPage);
export { TxpPage };
//# sourceMappingURL=txp.js.map