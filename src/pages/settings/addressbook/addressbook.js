import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { AddressProvider } from '../../../providers/address/address';
import { Logger } from '../../../providers/logger/logger';
import { AddressbookAddPage } from './add/add';
import { AddressbookViewPage } from './view/view';
let AddressbookPage = class AddressbookPage {
    constructor(navCtrl, navParams, logger, addressbookProvider, addressProvider) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.logger = logger;
        this.addressbookProvider = addressbookProvider;
        this.addressProvider = addressProvider;
        this.cache = false;
        this.addressbook = [];
        this.filteredAddressbook = [];
        this.initAddressbook();
    }
    ionViewDidEnter() {
        if (this.cache)
            this.initAddressbook();
        this.cache = true;
    }
    initAddressbook() {
        this.addressbookProvider
            .list()
            .then(addressBook => {
            this.isEmptyList = _.isEmpty(addressBook);
            let contacts = [];
            _.each(addressBook, (contact, k) => {
                const coinInfo = this.getCoinAndNetwork(k);
                contacts.push({
                    name: _.isObject(contact) ? contact.name : contact,
                    address: k,
                    email: _.isObject(contact) ? contact.email : null,
                    tag: _.isObject(contact) ? contact.tag : null,
                    coin: coinInfo.coin,
                    network: coinInfo.network
                });
            });
            this.addressbook = _.clone(contacts);
            this.filteredAddressbook = _.clone(this.addressbook);
        })
            .catch(err => {
            this.logger.error(err);
        });
    }
    addEntry() {
        this.navCtrl.push(AddressbookAddPage);
    }
    viewEntry(contact) {
        this.navCtrl.push(AddressbookViewPage, { contact });
    }
    getItems(event) {
        // set val to the value of the searchbar
        let val = event.target.value;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            let result = _.filter(this.addressbook, item => {
                let name = item['name'];
                return _.includes(name.toLowerCase(), val.toLowerCase());
            });
            this.filteredAddressbook = result;
        }
        else {
            // Reset items back to all of the items
            this.initAddressbook();
        }
    }
    getCoinAndNetwork(addr) {
        return this.addressProvider.getCoinAndNetwork(addr);
    }
};
AddressbookPage = __decorate([
    Component({
        selector: 'page-addressbook',
        templateUrl: 'addressbook.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Logger,
        AddressBookProvider,
        AddressProvider])
], AddressbookPage);
export { AddressbookPage };
//# sourceMappingURL=addressbook.js.map