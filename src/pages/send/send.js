import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams, Platform } from 'ionic-angular';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
// Providers
import { ActionSheetProvider } from '../../providers/action-sheet/action-sheet';
import { AddressProvider } from '../../providers/address/address';
import { AppProvider } from '../../providers/app/app';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ClipboardProvider } from '../../providers/clipboard/clipboard';
import { CurrencyProvider } from '../../providers/currency/currency';
import { ErrorsProvider } from '../../providers/errors/errors';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { Logger } from '../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PayproProvider } from '../../providers/paypro/paypro';
import { ProfileProvider } from '../../providers/profile/profile';
// Pages
import { CopayersPage } from '../add/copayers/copayers';
import { ImportWalletPage } from '../add/import-wallet/import-wallet';
import { JoinWalletPage } from '../add/join-wallet/join-wallet';
import { BitPayCardIntroPage } from '../integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { CoinbasePage } from '../integrations/coinbase/coinbase';
import { SelectInvoicePage } from '../integrations/invoice/select-invoice/select-invoice';
import { SimplexPage } from '../integrations/simplex/simplex';
import { PaperWalletPage } from '../paper-wallet/paper-wallet';
import { ScanPage } from '../scan/scan';
import { AmountPage } from '../send/amount/amount';
import { ConfirmPage } from '../send/confirm/confirm';
import { SelectInputsPage } from '../send/select-inputs/select-inputs';
import { AddressbookAddPage } from '../settings/addressbook/add/add';
import { WalletDetailsPage } from '../wallet-details/wallet-details';
import { MultiSendPage } from './multi-send/multi-send';
let SendPage = class SendPage {
    constructor(currencyProvider, navCtrl, navParams, payproProvider, profileProvider, logger, incomingDataProvider, addressProvider, events, actionSheetProvider, appProvider, translate, errorsProvider, onGoingProcessProvider, bwcErrorProvider, plt, clipboardProvider) {
        this.currencyProvider = currencyProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.payproProvider = payproProvider;
        this.profileProvider = profileProvider;
        this.logger = logger;
        this.incomingDataProvider = incomingDataProvider;
        this.addressProvider = addressProvider;
        this.events = events;
        this.actionSheetProvider = actionSheetProvider;
        this.appProvider = appProvider;
        this.translate = translate;
        this.errorsProvider = errorsProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.bwcErrorProvider = bwcErrorProvider;
        this.plt = plt;
        this.clipboardProvider = clipboardProvider;
        this.search = '';
        this.validDataTypeMap = [
            'BitcoinAddress',
            'BitcoinCashAddress',
            'EthereumAddress',
            'EthereumUri',
            'RippleAddress',
            'RippleUri',
            'BitcoinUri',
            'BitcoinCashUri',
            'BitPayUri'
        ];
        this.pageMap = {
            AddressbookAddPage,
            AmountPage,
            BitPayCardIntroPage,
            CoinbasePage,
            ConfirmPage,
            CopayersPage,
            ImportWalletPage,
            JoinWalletPage,
            PaperWalletPage,
            SimplexPage,
            SelectInvoicePage,
            WalletDetailsPage
        };
        this.SendPageRedirEventHandler = nextView => {
            const currentIndex = this.navCtrl.getActive().index;
            const currentView = this.navCtrl.getViews();
            nextView.params.fromWalletDetails = true;
            nextView.params.walletId = this.wallet.credentials.walletId;
            this.navCtrl
                .push(this.pageMap[nextView.name], nextView.params, { animate: false })
                .then(() => {
                if (currentView[currentIndex].name == 'ScanPage')
                    this.navCtrl.remove(currentIndex);
            });
        };
        this.updateAddressHandler = data => {
            this.search = data.value;
            this.processInput();
        };
        this.wallet = this.navParams.data.wallet;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: SendPage');
    }
    ionViewWillEnter() {
        this.events.subscribe('Local/AddressScan', this.updateAddressHandler);
        this.events.subscribe('SendPageRedir', this.SendPageRedirEventHandler);
        this.events.subscribe('Desktop/onFocus', () => {
            this.setDataFromClipboard();
        });
        this.onResumeSubscription = this.plt.resume.subscribe(() => {
            this.setDataFromClipboard();
        });
    }
    ionViewDidEnter() {
        return __awaiter(this, void 0, void 0, function* () {
            this.hasWallets = !_.isEmpty(this.profileProvider.getWallets({ coin: this.wallet.coin }));
            yield this.setDataFromClipboard();
        });
    }
    ngOnDestroy() {
        this.events.unsubscribe('Local/AddressScan', this.updateAddressHandler);
        this.events.unsubscribe('SendPageRedir', this.SendPageRedirEventHandler);
        this.events.unsubscribe('Desktop/onFocus');
        if (this.onResumeSubscription)
            this.onResumeSubscription.unsubscribe();
    }
    setDataFromClipboard() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clipboardProvider.getValidData(this.wallet.coin).then(data => {
                this.validDataFromClipboard = data;
            });
        });
    }
    shouldShowZeroState() {
        return (this.wallet &&
            this.wallet.cachedStatus &&
            !this.wallet.cachedStatus.totalBalanceSat);
    }
    openScanner() {
        this.navCtrl.push(ScanPage, { fromSend: true }, { animate: false });
    }
    showOptions(coin) {
        return (this.currencyProvider.isMultiSend(coin) ||
            this.currencyProvider.isUtxoCoin(coin));
    }
    checkCoinAndNetwork(data, isPayPro) {
        let isValid, addrData;
        if (isPayPro) {
            isValid =
                data &&
                    data.chain == this.currencyProvider.getChain(this.wallet.coin) &&
                    data.network == this.wallet.network;
        }
        else {
            addrData = this.addressProvider.getCoinAndNetwork(data, this.wallet.network);
            isValid =
                this.currencyProvider.getChain(this.wallet.coin).toLowerCase() ==
                    addrData.coin && addrData.network == this.wallet.network;
        }
        if (isValid) {
            this.invalidAddress = false;
            return true;
        }
        else {
            this.invalidAddress = true;
            let network = isPayPro ? data.network : addrData.network;
            if (this.wallet.coin === 'bch' && this.wallet.network === network) {
                const isLegacy = this.checkIfLegacy();
                isLegacy ? this.showLegacyAddrMessage() : this.showErrorMessage();
            }
            else {
                this.showErrorMessage();
            }
        }
        return false;
    }
    redir() {
        this.incomingDataProvider.redir(this.search, {
            activePage: 'SendPage',
            amount: this.navParams.data.amount,
            coin: this.navParams.data.coin // TODO ???? what is this for ?
        });
        this.search = '';
    }
    showErrorMessage() {
        const msg = this.translate.instant('The wallet you are using does not match the network and/or the currency of the address provided');
        const title = this.translate.instant('Error');
        this.errorsProvider.showDefaultError(msg, title, () => {
            this.search = '';
        });
    }
    showLegacyAddrMessage() {
        const appName = this.appProvider.info.nameCase;
        const infoSheet = this.actionSheetProvider.createInfoSheet('legacy-address-info', { appName });
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                const legacyAddr = this.search;
                const cashAddr = this.addressProvider.translateToCashAddress(legacyAddr);
                this.search = cashAddr;
                this.processInput();
            }
        });
    }
    cleanSearch() {
        this.search = '';
        this.invalidAddress = false;
    }
    processInput() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.search == '')
                this.invalidAddress = false;
            const hasContacts = yield this.checkIfContact();
            if (!hasContacts) {
                const parsedData = this.incomingDataProvider.parseData(this.search);
                if ((parsedData && parsedData.type == 'PayPro') ||
                    (parsedData && parsedData.type == 'InvoiceUri')) {
                    try {
                        const invoiceUrl = this.incomingDataProvider.getPayProUrl(this.search);
                        const payproOptions = yield this.payproProvider.getPayProOptions(invoiceUrl);
                        const selected = payproOptions.paymentOptions.find(option => option.selected &&
                            this.wallet.coin.toUpperCase() === option.currency);
                        if (selected) {
                            const activePage = 'SendPage';
                            const isValid = this.checkCoinAndNetwork(selected, true);
                            if (isValid) {
                                this.incomingDataProvider.goToPayPro(payproOptions.payProUrl, this.wallet.coin, undefined, true, activePage);
                            }
                        }
                        else {
                            this.redir();
                        }
                    }
                    catch (err) {
                        this.onGoingProcessProvider.clear();
                        this.invalidAddress = true;
                        this.logger.warn(this.bwcErrorProvider.msg(err));
                        this.errorsProvider.showDefaultError(this.bwcErrorProvider.msg(err), this.translate.instant('Error'));
                    }
                }
                else if (parsedData &&
                    _.indexOf(this.validDataTypeMap, parsedData.type) != -1) {
                    const isValid = this.checkCoinAndNetwork(this.search);
                    if (isValid)
                        this.redir();
                }
                else if (parsedData && parsedData.type == 'BitPayCard') {
                    // this.close();
                    this.incomingDataProvider.redir(this.search, {
                        activePage: 'SendPage'
                    });
                }
                else if (parsedData && parsedData.type == 'PrivateKey') {
                    this.incomingDataProvider.redir(this.search, {
                        activePage: 'SendPage'
                    });
                }
                else {
                    this.invalidAddress = true;
                }
            }
            else {
                this.invalidAddress = false;
            }
        });
    }
    checkIfContact() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Observable.timer(50).toPromise();
            return this.transferTo.hasContactsOrWallets;
        });
    }
    checkIfLegacy() {
        return (this.incomingDataProvider.isValidBitcoinCashLegacyAddress(this.search) ||
            this.incomingDataProvider.isValidBitcoinCashUriWithLegacyAddress(this.search));
    }
    showMoreOptions() {
        const optionsSheet = this.actionSheetProvider.createOptionsSheet('send-options', {
            isUtxoCoin: this.currencyProvider.isUtxoCoin(this.wallet.coin),
            isMultiSend: this.currencyProvider.isMultiSend(this.wallet.coin)
        });
        optionsSheet.present();
        optionsSheet.onDidDismiss(option => {
            if (option == 'multi-send')
                this.navCtrl.push(MultiSendPage, {
                    wallet: this.wallet
                });
            if (option == 'select-inputs')
                this.navCtrl.push(SelectInputsPage, {
                    wallet: this.wallet
                });
        });
    }
    pasteFromClipboard() {
        this.search = this.validDataFromClipboard || '';
        this.validDataFromClipboard = null;
        this.clipboardProvider.clear();
        this.processInput();
    }
};
__decorate([
    ViewChild('transferTo'),
    __metadata("design:type", Object)
], SendPage.prototype, "transferTo", void 0);
SendPage = __decorate([
    Component({
        selector: 'page-send',
        templateUrl: 'send.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        NavController,
        NavParams,
        PayproProvider,
        ProfileProvider,
        Logger,
        IncomingDataProvider,
        AddressProvider,
        Events,
        ActionSheetProvider,
        AppProvider,
        TranslateService,
        ErrorsProvider,
        OnGoingProcessProvider,
        BwcErrorProvider,
        Platform,
        ClipboardProvider])
], SendPage);
export { SendPage };
//# sourceMappingURL=send.js.map