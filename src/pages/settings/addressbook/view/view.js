import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
// Pages
import { AmountPage } from '../../../../pages/send/amount/amount';
// Providers
import { AddressBookProvider } from '../../../../providers/address-book/address-book';
import { AddressProvider } from '../../../../providers/address/address';
import { ActionSheetProvider } from '../../../../providers/index';
import { PopupProvider } from '../../../../providers/popup/popup';
let AddressbookViewPage = class AddressbookViewPage {
    constructor(addressBookProvider, addressProvider, navCtrl, navParams, popupProvider, translate, actionSheetProvider) {
        this.addressBookProvider = addressBookProvider;
        this.addressProvider = addressProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.popupProvider = popupProvider;
        this.translate = translate;
        this.actionSheetProvider = actionSheetProvider;
        this.address = this.navParams.data.contact.address;
        const addrData = this.addressProvider.getCoinAndNetwork(this.address);
        this.coin = addrData.coin;
        this.network = addrData.network;
        this.name = this.navParams.data.contact.name;
        this.email = this.navParams.data.contact.email;
        this.tag = this.navParams.data.contact.tag;
    }
    ionViewDidLoad() { }
    sendTo() {
        this.navCtrl.push(AmountPage, {
            toAddress: this.address,
            name: this.name,
            email: this.email,
            destinationTag: this.tag,
            coin: this.coin,
            recipientType: 'contact',
            network: this.network
        });
    }
    remove() {
        const title = this.translate.instant('Warning!');
        const message = this.translate.instant('Are you sure you want to delete this contact?');
        this.popupProvider.ionicConfirm(title, message, null, null).then(res => {
            if (!res)
                return;
            this.addressBookProvider
                .remove(this.address)
                .then(() => {
                this.navCtrl.pop();
            })
                .catch(err => {
                this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
                return;
            });
        });
    }
    showMoreOptions() {
        const optionsSheet = this.actionSheetProvider.createOptionsSheet('address-book', { coin: this.coin.toUpperCase() });
        optionsSheet.present();
        optionsSheet.onDidDismiss(option => {
            if (option == 'send-to-contact')
                this.sendTo();
            if (option == 'delete-contact')
                this.remove();
        });
    }
};
AddressbookViewPage = __decorate([
    Component({
        selector: 'page-addressbook-view',
        templateUrl: 'view.html'
    }),
    __metadata("design:paramtypes", [AddressBookProvider,
        AddressProvider,
        NavController,
        NavParams,
        PopupProvider,
        TranslateService,
        ActionSheetProvider])
], AddressbookViewPage);
export { AddressbookViewPage };
//# sourceMappingURL=view.js.map