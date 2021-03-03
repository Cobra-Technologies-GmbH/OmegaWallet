import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Events, NavController, NavParams } from 'ionic-angular';
// providers
import { AddressBookProvider } from '../../../../providers/address-book/address-book';
import { AddressProvider } from '../../../../providers/address/address';
import { AppProvider } from '../../../../providers/app/app';
import { Logger } from '../../../../providers/logger/logger';
import { PopupProvider } from '../../../../providers/popup/popup';
// validators
import { AddressValidator } from '../../../../validators/address';
import { ScanPage } from '../../../scan/scan';
let AddressbookAddPage = class AddressbookAddPage {
    constructor(navCtrl, navParams, events, ab, addressProvider, appProvider, formBuilder, logger, popupProvider) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.events = events;
        this.ab = ab;
        this.addressProvider = addressProvider;
        this.appProvider = appProvider;
        this.formBuilder = formBuilder;
        this.logger = logger;
        this.popupProvider = popupProvider;
        this.updateAddressHandler = data => {
            if (this.regex.test(data.value) &&
                this.addressBookAdd.value.address &&
                this.getCoinAndNetwork() &&
                this.getCoinAndNetwork().coin === 'xrp') {
                this.addressBookAdd.controls['tag'].setValue(data.value);
            }
            else {
                this.addressBookAdd.controls['address'].setValue(this.parseAddress(data.value));
            }
        };
        this.regex = /^[0-9]{9,}$/;
        this.addressBookAdd = this.formBuilder.group({
            name: [
                '',
                Validators.compose([Validators.minLength(1), Validators.required])
            ],
            email: ['', this.emailOrEmpty],
            address: [
                '',
                Validators.compose([
                    Validators.required,
                    new AddressValidator(this.addressProvider).isValid
                ])
            ],
            tag: ['', Validators.pattern(this.regex)]
        });
        if (this.navParams.data.addressbookEntry) {
            this.addressBookAdd.controls['address'].setValue(this.navParams.data.addressbookEntry);
        }
        this.appName = this.appProvider.info.nameCase;
        this.events.subscribe('Local/AddressScan', this.updateAddressHandler);
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: AddressbookAddPage');
    }
    ngOnDestroy() {
        this.events.unsubscribe('Local/AddressScan', this.updateAddressHandler);
    }
    emailOrEmpty(control) {
        return control.value === '' ? null : Validators.email(control);
    }
    save() {
        this.addressBookAdd.controls['address'].setValue(this.parseAddress(this.addressBookAdd.value.address));
        this.ab
            .add(this.addressBookAdd.value)
            .then(() => {
            this.navCtrl.pop();
        })
            .catch(err => {
            this.popupProvider.ionicAlert('Error', err);
        });
    }
    parseAddress(str) {
        return this.addressProvider.extractAddress(str);
    }
    openScanner() {
        this.navCtrl.push(ScanPage, { fromAddressbook: true });
    }
    getCoinAndNetwork() {
        return this.addressProvider.getCoinAndNetwork(this.addressBookAdd.value.address);
    }
};
AddressbookAddPage = __decorate([
    Component({
        selector: 'page-addressbook-add',
        templateUrl: 'add.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Events,
        AddressBookProvider,
        AddressProvider,
        AppProvider,
        FormBuilder,
        Logger,
        PopupProvider])
], AddressbookAddPage);
export { AddressbookAddPage };
//# sourceMappingURL=add.js.map