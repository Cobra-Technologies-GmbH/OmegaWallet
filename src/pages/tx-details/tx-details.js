import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../providers/logger/logger';
// Providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { ConfigProvider } from '../../providers/config/config';
import { CurrencyProvider } from '../../providers/currency/currency';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FilterProvider } from '../../providers/filter/filter';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { RateProvider } from '../../providers/rate/rate';
import { TxConfirmNotificationProvider } from '../../providers/tx-confirm-notification/tx-confirm-notification';
import { TxFormatProvider } from '../../providers/tx-format/tx-format';
import { WalletProvider } from '../../providers/wallet/wallet';
let TxDetailsModal = class TxDetailsModal {
    constructor(addressBookProvider, configProvider, currencyProvider, events, externalLinkProvider, logger, navCtrl, navParams, onGoingProcess, popupProvider, profileProvider, txConfirmNotificationProvider, txFormatProvider, walletProvider, translate, filter, rateProvider, viewCtrl) {
        this.addressBookProvider = addressBookProvider;
        this.configProvider = configProvider;
        this.currencyProvider = currencyProvider;
        this.events = events;
        this.externalLinkProvider = externalLinkProvider;
        this.logger = logger;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.onGoingProcess = onGoingProcess;
        this.popupProvider = popupProvider;
        this.profileProvider = profileProvider;
        this.txConfirmNotificationProvider = txConfirmNotificationProvider;
        this.txFormatProvider = txFormatProvider;
        this.walletProvider = walletProvider;
        this.translate = translate;
        this.filter = filter;
        this.rateProvider = rateProvider;
        this.viewCtrl = viewCtrl;
        this.bwsEventHandler = (_, type, n) => {
            let match = false;
            if (type == 'NewBlock' &&
                n &&
                n.data &&
                this.wallet &&
                n.data &&
                n.data.network == this.wallet.network &&
                n.data.coin == this.wallet.coin) {
                match = true;
                this.updateTxDebounced({ hideLoading: true });
            }
            this.logger.debug('bwsEvent handler @tx-details. Matched: ' + match);
        };
        this.updateTxDebounced = _.debounce((hideLoading) => __awaiter(this, void 0, void 0, function* () {
            this.updateTx({ hideLoading });
        }), 1000, {
            leading: true
        });
    }
    ionViewDidLoad() {
        this.config = this.configProvider.get();
        this.txId = this.navParams.data.txid;
        this.title = this.translate.instant('Transaction');
        this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
        this.color = this.wallet.color;
        this.copayerId = this.wallet.credentials.copayerId;
        this.isShared = this.wallet.credentials.n > 1;
        this.txsUnsubscribedForNotifications = this.config.confirmedTxsNotifications
            ? !this.config.confirmedTxsNotifications.enabled
            : true;
        let defaults = this.configProvider.getDefaults();
        this.blockexplorerUrl = defaults.blockExplorerUrl[this.wallet.coin];
        this.blockexplorerUrlTestnet =
            defaults.blockExplorerUrlTestnet[this.wallet.coin];
        this.txConfirmNotificationProvider.checkIfEnabled(this.txId).then(res => {
            this.txNotification = {
                value: res
            };
        });
        this.updateTx();
    }
    ionViewWillLoad() {
        this.events.subscribe('bwsEvent', this.bwsEventHandler);
    }
    ionViewWillUnload() {
        this.events.unsubscribe('bwsEvent', this.bwsEventHandler);
    }
    readMore() {
        let url = 'https://support.bitpay.com/hc/en-us/articles/115004497783-What-does-the-BitPay-wallet-s-warning-amount-too-low-to-spend-mean-';
        let optIn = true;
        let title = null;
        let message = this.translate.instant('Read more in our support page');
        let okText = this.translate.instant('Open');
        let cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    updateMemo() {
        this.walletProvider
            .getTxNote(this.wallet, this.btx.txid)
            .then(note => {
            if (!note || note.body == '')
                return;
            this.btx.note = note;
        })
            .catch(err => {
            this.logger.warn('Could not fetch transaction note: ' + err);
            return;
        });
    }
    initActionList() {
        this.actionList = [];
        if ((this.btx.action != 'sent' && this.btx.action != 'moved') ||
            !this.isShared)
            return;
        let actionDescriptions = {
            created: this.translate.instant('Proposal Created'),
            failed: this.translate.instant('Execution Failed'),
            accept: this.translate.instant('Accepted'),
            reject: this.translate.instant('Rejected'),
            broadcasted: this.translate.instant('Broadcasted')
        };
        this.actionList.push({
            type: 'created',
            time: this.btx.createdOn,
            description: actionDescriptions.created,
            by: this.btx.creatorName
        });
        _.each(this.btx.actions, action => {
            this.actionList.push({
                type: action.type,
                time: action.createdOn,
                description: actionDescriptions[action.type],
                by: action.copayerName
            });
        });
        this.actionList.push({
            type: 'broadcasted',
            time: this.btx.time,
            description: actionDescriptions.broadcasted
        });
        setTimeout(() => {
            this.actionList.reverse();
        }, 10);
    }
    updateTx(opts) {
        opts = opts ? opts : {};
        if (!opts.hideLoading)
            this.onGoingProcess.set('loadingTxInfo');
        this.walletProvider
            .getTx(this.wallet, this.txId)
            .then(tx => {
            if (!opts.hideLoading)
                this.onGoingProcess.clear();
            this.btx = this.txFormatProvider.processTx(this.wallet.coin, tx);
            this.btx.network = this.wallet.credentials.network;
            this.btx.coin = this.wallet.coin;
            const chain = this.currencyProvider
                .getChain(this.wallet.coin)
                .toLowerCase();
            this.btx.feeFiatStr = this.txFormatProvider.formatAlternativeStr(chain, tx.fees);
            if (this.currencyProvider.isUtxoCoin(this.wallet.coin)) {
                this.btx.feeRateStr =
                    ((this.btx.fees / (this.btx.amount + this.btx.fees)) * 100).toFixed(2) + '%';
            }
            if (!this.btx.note) {
                this.txMemo = this.btx.message;
            }
            if (this.btx.note && this.btx.note.body) {
                this.txMemo = this.btx.note.body;
            }
            if (this.btx.action != 'invalid') {
                if (this.btx.action == 'sent')
                    this.title = this.translate.instant('Sent');
                if (this.btx.action == 'received')
                    this.title = this.translate.instant('Received');
                if (this.btx.action == 'moved')
                    this.title = this.translate.instant('Sent to self');
            }
            this.updateMemo();
            this.initActionList();
            this.contact();
            this.updateFiatRate();
            if (this.currencyProvider.isUtxoCoin(this.wallet.coin)) {
                this.walletProvider
                    .getLowAmount(this.wallet)
                    .then((amount) => {
                    this.btx.lowAmount = tx.amount < amount;
                })
                    .catch(err => {
                    this.logger.warn('Error getting low amounts: ' + err);
                    return;
                });
            }
        })
            .catch(err => {
            if (!opts.hideLoading)
                this.onGoingProcess.clear();
            this.logger.warn('Error getting transaction: ' + err);
            this.navCtrl.pop();
            return this.popupProvider.ionicAlert('Error', this.translate.instant('Transaction not available at this time'));
        });
    }
    saveMemoInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Saving memo: ', this.txMemo);
            this.btx.note = {
                body: this.txMemo
            };
            let args = {
                txid: this.btx.txid,
                body: this.txMemo
            };
            yield this.walletProvider
                .editTxNote(this.wallet, args)
                .catch((err) => {
                this.logger.error('Could not save tx comment ' + err);
            });
            this.logger.info('Tx Note edited');
        });
    }
    viewOnBlockchain() {
        let btx = this.btx;
        const url = this.wallet.credentials.network === 'livenet'
            ? `https://${this.blockexplorerUrl}tx/${btx.txid}`
            : `https://${this.blockexplorerUrlTestnet}tx/${btx.txid}`;
        let optIn = true;
        let title = null;
        let message = this.translate.instant('View Transaction');
        let okText = this.translate.instant('Open');
        let cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    txConfirmNotificationChange() {
        if (this.txNotification.value) {
            this.txConfirmNotificationProvider.subscribe(this.wallet, {
                txid: this.txId
            });
        }
        else {
            this.txConfirmNotificationProvider.unsubscribe(this.wallet, this.txId);
        }
    }
    contact() {
        let addr = this.btx.addressTo;
        this.addressBookProvider
            .get(addr)
            .then(ab => {
            if (ab) {
                let name = _.isObject(ab) ? ab.name : ab;
                this.contactName = name;
            }
        })
            .catch(err => {
            this.logger.warn(err);
        });
    }
    openExternalLink(url) {
        const optIn = true;
        const title = null;
        const message = this.translate.instant('Help and support information is available at the website.');
        const okText = this.translate.instant('Open');
        const cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    updateFiatRate() {
        const settings = this.configProvider.get().wallet.settings;
        this.rateProvider
            .getHistoricFiatRate(settings.alternativeIsoCode, this.wallet.coin, (this.btx.time * 1000).toString())
            .then(fiat => {
            if (fiat && fiat.rate) {
                this.btx.fiatRateStr =
                    this.filter.formatFiatAmount(parseFloat((fiat.rate * this.btx.amountValueStr).toFixed(2))) +
                        ' ' +
                        settings.alternativeIsoCode +
                        ' @ ' +
                        this.filter.formatFiatAmount(fiat.rate) +
                        ` ${settings.alternativeIsoCode} per ` +
                        this.wallet.coin.toUpperCase();
            }
            else {
                this.btx.fiatRateStr = this.btx.alternativeAmountStr;
            }
        });
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
TxDetailsModal = __decorate([
    Component({
        selector: 'page-tx-details',
        templateUrl: 'tx-details.html'
    }),
    __metadata("design:paramtypes", [AddressBookProvider,
        ConfigProvider,
        CurrencyProvider,
        Events,
        ExternalLinkProvider,
        Logger,
        NavController,
        NavParams,
        OnGoingProcessProvider,
        PopupProvider,
        ProfileProvider,
        TxConfirmNotificationProvider,
        TxFormatProvider,
        WalletProvider,
        TranslateService,
        FilterProvider,
        RateProvider,
        ViewController])
], TxDetailsModal);
export { TxDetailsModal };
//# sourceMappingURL=tx-details.js.map