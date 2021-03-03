import { __decorate, __metadata } from "tslib";
import { Component, Input } from '@angular/core';
import { Events, NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'lodash';
// Providers
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { AddressProvider } from '../../../providers/address/address';
import { CurrencyProvider } from '../../../providers/currency/currency';
import { Logger } from '../../../providers/logger/logger';
import { PopupProvider } from '../../../providers/popup/popup';
import { ProfileProvider } from '../../../providers/profile/profile';
import { WalletProvider } from '../../../providers/wallet/wallet';
// Pages
import { AmountPage } from '../amount/amount';
let TransferToPage = class TransferToPage {
    constructor(currencyProvider, navCtrl, navParams, profileProvider, walletProvider, addressBookProvider, logger, popupProvider, addressProvider, viewCtrl, events) {
        this.currencyProvider = currencyProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.profileProvider = profileProvider;
        this.walletProvider = walletProvider;
        this.addressBookProvider = addressBookProvider;
        this.logger = logger;
        this.popupProvider = popupProvider;
        this.addressProvider = addressProvider;
        this.viewCtrl = viewCtrl;
        this.events = events;
        this.search = '';
        this.wallets = {};
        this.hasWallets = {};
        this.walletList = {};
        this.contactsList = [];
        this.filteredContactsList = [];
        this.filteredWallets = [];
        this.walletsByKeys = [];
        this.filteredWalletsByKeys = [];
        this.CONTACTS_SHOW_LIMIT = 10;
        this.currentContactsPage = 0;
        this.availableCoins = this.currencyProvider.getAvailableCoins();
        for (const coin of this.availableCoins) {
            this.wallets[coin] = this.profileProvider.getWallets({ coin });
            this.hasWallets[coin] = !_.isEmpty(this.wallets[coin]);
        }
    }
    set wallet(wallet) {
        this._wallet = this.navParams.data.wallet
            ? this.navParams.data.wallet
            : wallet;
        for (const coin of this.availableCoins) {
            this.walletList[coin] = _.compact(this.getWalletsList(coin));
        }
        this.walletsByKeys = _.values(_.groupBy(this.walletList[this._wallet.coin], 'keyId'));
        this.updateContactsList();
    }
    get wallet() {
        return this._wallet;
    }
    set searchInput(search) {
        this.search = search;
        this.processInput();
    }
    get searchInput() {
        return this.search;
    }
    set useAsModal(useAsModal) {
        this._useAsModal = useAsModal;
    }
    get useAsModal() {
        return this._useAsModal;
    }
    set fromWalletDetails(fromWalletDetails) {
        this._fromWalletDetails = fromWalletDetails;
    }
    get fromWalletDetails() {
        return this._fromWalletDetails;
    }
    set fromSelectInputs(fromSelectInputs) {
        this._fromSelectInputs = fromSelectInputs;
    }
    get fromSelectInputs() {
        return this._fromSelectInputs;
    }
    set fromMultiSend(fromMultiSend) {
        this._fromMultiSend = fromMultiSend;
    }
    get fromMultiSend() {
        return this._fromMultiSend;
    }
    getCoinName(coin) {
        return this.currencyProvider.getCoinName(coin);
    }
    getWalletsList(coin) {
        return this.hasWallets[coin]
            ? this.getRelevantWallets(this.wallets[coin])
            : [];
    }
    getRelevantWallets(rawWallets) {
        return rawWallets
            .map(wallet => this.flattenWallet(wallet))
            .filter(wallet => this.filterIrrelevantRecipients(wallet));
    }
    updateContactsList() {
        this.addressBookProvider.list().then(ab => {
            this.hasContacts = _.isEmpty(ab) ? false : true;
            if (!this.hasContacts)
                return;
            let contactsList = [];
            _.each(ab, (v, k) => {
                const addrData = this.addressProvider.getCoinAndNetwork(k);
                contactsList.push({
                    name: _.isObject(v) ? v.name : v,
                    address: k,
                    network: addrData.network,
                    email: _.isObject(v) ? v.email : null,
                    recipientType: 'contact',
                    coin: addrData.coin,
                    getAddress: () => Promise.resolve(k),
                    destinationTag: v.tag
                });
            });
            contactsList = _.orderBy(contactsList, 'name');
            this.contactsList = contactsList.filter(c => this.filterIrrelevantRecipients(c));
            let shortContactsList = _.clone(this.contactsList.slice(0, (this.currentContactsPage + 1) * this.CONTACTS_SHOW_LIMIT));
            this.filteredContactsList = _.clone(shortContactsList);
            this.contactsShowMore =
                this.contactsList.length > shortContactsList.length;
        });
    }
    flattenWallet(wallet) {
        return {
            walletId: wallet.credentials.walletId,
            color: wallet.color,
            name: wallet.name,
            recipientType: 'wallet',
            coin: wallet.coin,
            network: wallet.network,
            m: wallet.credentials.m,
            n: wallet.credentials.n,
            keyId: wallet.keyId,
            walletGroupName: wallet.walletGroupName,
            isComplete: () => wallet.isComplete(),
            needsBackup: wallet.needsBackup,
            getAddress: () => this.walletProvider.getAddress(wallet, false)
        };
    }
    filterIrrelevantRecipients(recipient) {
        return this._wallet
            ? this._wallet.coin === recipient.coin &&
                this._wallet.network === recipient.network &&
                this._wallet.id !== recipient.walletId
            : true;
    }
    showMore() {
        this.currentContactsPage++;
        this.updateContactsList();
    }
    processInput() {
        if (this.search && this.search.trim() != '') {
            this.searchWallets();
            this.searchContacts();
            this.hasContactsOrWallets =
                this.filteredContactsList.length === 0 &&
                    this.filteredWallets.length === 0
                    ? false
                    : true;
        }
        else {
            this.updateContactsList();
            this.filteredWallets = [];
            this.filteredWalletsByKeys = [];
        }
    }
    searchWallets() {
        for (const coin of this.availableCoins) {
            if (this.hasWallets[coin] && this._wallet.coin === coin) {
                this.filteredWallets = this.walletList[coin].filter(wallet => {
                    return _.includes(wallet.name.toLowerCase(), this.search.toLowerCase());
                });
                this.filteredWalletsByKeys = _.values(_.groupBy(this.filteredWallets, 'keyId'));
            }
        }
    }
    searchContacts() {
        this.filteredContactsList = _.filter(this.contactsList, item => {
            let val = item.name;
            return _.includes(val.toLowerCase(), this.search.toLowerCase());
        });
    }
    close(item) {
        item
            .getAddress()
            .then((addr) => {
            if (!addr) {
                // Error is already formated
                this.popupProvider.ionicAlert('Error - no address');
                return;
            }
            this.logger.debug('Got address:' + addr + ' | ' + item.name);
            if (this._fromSelectInputs) {
                const recipient = {
                    recipientType: item.recipientType,
                    toAddress: addr,
                    name: item.name,
                    email: item.email
                };
                this.events.publish('addRecipient', recipient);
                this.viewCtrl.dismiss();
            }
            else {
                this.navCtrl.push(AmountPage, {
                    walletId: this.navParams.data.wallet.id,
                    recipientType: item.recipientType,
                    amount: parseInt(this.navParams.data.amount, 10),
                    toAddress: addr,
                    name: item.name,
                    email: item.email,
                    color: item.color,
                    coin: item.coin,
                    network: item.network,
                    useAsModal: this._useAsModal,
                    fromWalletDetails: this._fromWalletDetails,
                    fromMultiSend: this._fromMultiSend,
                    destinationTag: item.destinationTag
                });
            }
        })
            .catch(err => {
            this.logger.error('Send: could not getAddress', err);
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], TransferToPage.prototype, "wallet", null);
__decorate([
    Input(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], TransferToPage.prototype, "searchInput", null);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], TransferToPage.prototype, "useAsModal", null);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], TransferToPage.prototype, "fromWalletDetails", null);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], TransferToPage.prototype, "fromSelectInputs", null);
__decorate([
    Input(),
    __metadata("design:type", Boolean),
    __metadata("design:paramtypes", [Boolean])
], TransferToPage.prototype, "fromMultiSend", null);
TransferToPage = __decorate([
    Component({
        selector: 'page-transfer-to',
        templateUrl: 'transfer-to.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        NavController,
        NavParams,
        ProfileProvider,
        WalletProvider,
        AddressBookProvider,
        Logger,
        PopupProvider,
        AddressProvider,
        ViewController,
        Events])
], TransferToPage);
export { TransferToPage };
//# sourceMappingURL=transfer-to.js.map