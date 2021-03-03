import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// Providers
import { AddressProvider } from '../../../providers/address/address';
import { GnosisFactories } from '../../../providers/currency/gnosisFactories';
import { ErrorsProvider } from '../../../providers/errors/errors';
import { IncomingDataProvider } from '../../../providers/incoming-data/incoming-data';
import { Logger } from '../../../providers/logger/logger';
import { WalletProvider } from '../../../providers/wallet/wallet';
// Pages
import { ScanPage } from '../../scan/scan';
let CreateEthMultisigPage = class CreateEthMultisigPage {
    constructor(addressProvider, errorsProvider, events, incomingDataProvider, logger, navParams, translate, walletProvider, navCtrl) {
        this.addressProvider = addressProvider;
        this.errorsProvider = errorsProvider;
        this.events = events;
        this.incomingDataProvider = incomingDataProvider;
        this.logger = logger;
        this.navParams = navParams;
        this.translate = translate;
        this.walletProvider = walletProvider;
        this.navCtrl = navCtrl;
        this.multisigAddresses = [];
        this.search = '';
        this.updateAddressHandler = data => {
            this.search = data.value;
            this.processInput();
        };
        this.pairedWallet = this.navParams.data.pairedWallet;
        this.n = this.navParams.data.n;
        this.m = this.navParams.data.m;
        this.events.subscribe('Local/AddressScanEthMultisig', this.updateAddressHandler);
        this.walletProvider.getAddress(this.pairedWallet, false).then(address => {
            this.multisigAddresses = [address];
        });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CreateEthMultisigPage');
    }
    ngOnDestroy() {
        this.events.unsubscribe('Local/AddressScanEthMultisig', this.updateAddressHandler);
    }
    processInput() {
        const validDataTypeMap = ['EthereumAddress'];
        if (this.search && this.search.trim() != '') {
            const parsedData = this.incomingDataProvider.parseData(this.search);
            if (parsedData && _.indexOf(validDataTypeMap, parsedData.type) != -1) {
                const isValid = this.checkCoinAndNetwork(this.search);
                if (isValid) {
                    setTimeout(() => {
                        this.invalidAddress = false;
                        this.addAddress(this.search);
                    }, 100);
                }
                else {
                    this.invalidAddress = true;
                    const msg = this.translate.instant('The wallet you are using does not match the network and/or the currency of the address provided');
                    this.showErrorMessage(msg);
                }
            }
            else {
                this.invalidAddress = true;
            }
        }
    }
    cleanSearch() {
        this.search = '';
    }
    openScanner() {
        this.navCtrl.push(ScanPage, { fromEthMultisig: true });
    }
    checkCoinAndNetwork(address) {
        const addrData = this.addressProvider.getCoinAndNetwork(address, this.pairedWallet.network);
        const isValid = Boolean(addrData &&
            this.pairedWallet.coin == addrData.coin &&
            this.pairedWallet.network == addrData.network);
        return isValid;
    }
    showErrorMessage(msg) {
        const title = this.translate.instant('Error');
        this.errorsProvider.showDefaultError(msg, title, () => {
            this.cleanSearch();
        });
    }
    addAddress(address) {
        if (!address)
            return;
        if (this.n == this.multisigAddresses.length) {
            const msg = this.translate.instant('The maximum number of Copayers has already been reached');
            this.showErrorMessage(msg);
            this.cleanSearch();
            return;
        }
        if (_.includes(this.multisigAddresses, address)) {
            const msg = this.translate.instant('Address already added');
            this.showErrorMessage(msg);
            this.cleanSearch();
            return;
        }
        this.multisigAddresses.push(address);
        this.cleanSearch();
    }
    removeAddress(index) {
        this.multisigAddresses.splice(index, 1);
    }
    goToConfirm() {
        const amount = 0;
        const network = this.navParams.data.testnetEnabled ? 'testnet' : 'livenet';
        let nextView = {
            name: 'ConfirmPage',
            params: {
                walletName: this.navParams.data.walletName,
                walletId: this.pairedWallet.credentials.walletId,
                amount,
                description: this.translate.instant('ETH Multisig Wallet creation'),
                multisigAddresses: this.multisigAddresses,
                requiredConfirmations: this.m,
                totalCopayers: this.n,
                coin: this.pairedWallet.coin,
                network,
                isEthMultisigInstantiation: true,
                multisigContractAddress: GnosisFactories[network],
                toAddress: GnosisFactories[network] // address gnosis multisig contract
            }
        };
        this.events.publish('IncomingDataRedir', nextView);
    }
};
CreateEthMultisigPage = __decorate([
    Component({
        selector: 'page-create-eth-multisig',
        templateUrl: 'create-eth-multisig.html'
    }),
    __metadata("design:paramtypes", [AddressProvider,
        ErrorsProvider,
        Events,
        IncomingDataProvider,
        Logger,
        NavParams,
        TranslateService,
        WalletProvider,
        NavController])
], CreateEthMultisigPage);
export { CreateEthMultisigPage };
//# sourceMappingURL=create-eth-multisig.js.map