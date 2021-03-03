import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController, NavParams, ViewController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';
// providers
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ConfigProvider } from '../../providers/config/config';
import { CurrencyProvider } from '../../providers/currency/currency';
import { ErrorsProvider } from '../../providers/errors/errors';
import { FeeProvider } from '../../providers/fee/fee';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PayproProvider } from '../../providers/paypro/paypro';
import { PlatformProvider } from '../../providers/platform/platform';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { TxFormatProvider } from '../../providers/tx-format/tx-format';
import { WalletProvider } from '../../providers/wallet/wallet';
// pages
import { FinishModalPage } from '../finish/finish';
import * as _ from 'lodash';
let TxpDetailsPage = class TxpDetailsPage {
    constructor(navParams, platformProvider, feeProvider, events, logger, popupProvider, walletProvider, onGoingProcessProvider, viewCtrl, configProvider, currencyProvider, profileProvider, txFormatProvider, translate, modalCtrl, payproProvider, bwcErrorProvider, errorsProvider) {
        this.navParams = navParams;
        this.platformProvider = platformProvider;
        this.feeProvider = feeProvider;
        this.events = events;
        this.logger = logger;
        this.popupProvider = popupProvider;
        this.walletProvider = walletProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.viewCtrl = viewCtrl;
        this.configProvider = configProvider;
        this.currencyProvider = currencyProvider;
        this.profileProvider = profileProvider;
        this.txFormatProvider = txFormatProvider;
        this.translate = translate;
        this.modalCtrl = modalCtrl;
        this.payproProvider = payproProvider;
        this.bwcErrorProvider = bwcErrorProvider;
        this.errorsProvider = errorsProvider;
        this.bwsEventHandler = (walletId, type) => {
            _.each([
                'TxProposalRejectedBy',
                'TxProposalAcceptedBy',
                'transactionProposalRemoved',
                'TxProposalRemoved',
                'NewOutgoingTx',
                'UpdateTx'
            ], (eventName) => {
                if (walletId == this.wallet.id && type == eventName) {
                    this.updateTxInfo(eventName);
                }
            });
        };
        this.showMultiplesOutputs = false;
        let config = this.configProvider.get().wallet;
        this.tx = this.navParams.data.tx;
        this.wallet = this.tx.wallet
            ? this.tx.wallet
            : this.profileProvider.getWallet(this.tx.walletId);
        this.tx = this.txFormatProvider.processTx(this.wallet.coin, this.tx);
        if (!this.tx.toAddress)
            this.tx.toAddress = this.tx.outputs[0].toAddress;
        this.currentSpendUnconfirmed = config.spendUnconfirmed;
        this.loading = false;
        this.isCordova = this.platformProvider.isCordova;
        this.copayers = this.wallet.cachedStatus.wallet.copayers;
        this.copayerId = this.wallet.credentials.copayerId;
        this.isShared = this.wallet.credentials.n > 1;
        this.canSign = this.wallet.canSign;
        this.color = this.wallet.color;
        // To test multiple outputs...
        // var txp = {
        //   message: 'test multi-output',
        //   fee: 1000,
        //   createdOn: Math.floor(Date.now() / 1000),
        //   outputs: [],
        // };
        // for (let i = 0; i < 15; i++) {
        //   txp.outputs.push({
        //     amountStr: "600 BTC",
        //     toAddress: '2N8bhEwbKtMvR2jqMRcTCQqzHP6zXGToXcK',
        //     message: 'output #' + (Number(i) + 1)
        //   });
        // };
        // this.tx = _.merge(this.tx, txp);
        // this.tx.hasMultiplesOutputs = true;
    }
    ionViewDidLoad() {
        this.displayFeeValues();
        this.initActionList();
        this.checkPaypro();
        this.applyButtonText();
        this.amount = this.txFormatProvider.formatAmount(this.wallet.coin, this.tx.amount);
    }
    ionViewWillLoad() {
        this.events.subscribe('bwsEvent', this.bwsEventHandler);
    }
    ionViewWillUnload() {
        this.events.unsubscribe('bwsEvent', this.bwsEventHandler);
    }
    displayFeeValues() {
        const chain = this.currencyProvider
            .getChain(this.wallet.coin)
            .toLowerCase();
        this.tx.feeFiatStr = this.txFormatProvider.formatAlternativeStr(chain, this.tx.fee);
        if (this.currencyProvider.isUtxoCoin(this.wallet.coin)) {
            this.tx.feeRateStr =
                ((this.tx.fee / (this.tx.amount + this.tx.fee)) * 100).toFixed(2) + '%';
        }
        const feeOpts = this.feeProvider.getFeeOpts();
        this.tx.feeLevelStr = feeOpts[this.tx.feeLevel];
    }
    applyButtonText() {
        var lastSigner = _.filter(this.tx.actions, {
            type: 'accept'
        }).length ==
            this.tx.requiredSignatures - 1;
        if (this.isShared && this.tx.coin === 'eth') {
            this.buttonText = this.translate.instant('Continue');
        }
        else if (lastSigner) {
            this.buttonText = this.isCordova
                ? this.translate.instant('Slide to send')
                : this.translate.instant('Click to send');
            this.successText = this.translate.instant('Payment Sent');
        }
        else {
            this.buttonText = this.isCordova
                ? this.translate.instant('Slide to accept')
                : this.translate.instant('Click to accept');
            this.successText = this.translate.instant('Payment Accepted');
        }
    }
    initActionList() {
        this.actionList = [];
        if (!this.isShared)
            return;
        var actionDescriptions = {
            created: this.translate.instant('Proposal Created'),
            failed: this.translate.instant('Execution Failed'),
            accept: this.translate.instant('Accepted'),
            reject: this.translate.instant('Rejected'),
            broadcasted: this.translate.instant('Broadcasted')
        };
        this.actionList.push({
            type: 'created',
            time: this.tx.createdOn,
            description: actionDescriptions['created'],
            by: this.tx.creatorName
        });
        _.each(this.tx.actions, action => {
            this.actionList.push({
                type: action.type,
                time: action.createdOn,
                description: actionDescriptions[action.type],
                by: action.copayerName
            });
        });
        setTimeout(() => {
            this.actionList.reverse();
        }, 10);
    }
    checkPaypro() {
        if (this.tx.payProUrl) {
            this.walletProvider
                .getAddress(this.wallet, false)
                .then(address => {
                const payload = {
                    address
                };
                const disableLoader = true;
                this.payproProvider
                    .getPayProDetails({
                    paymentUrl: this.tx.payProUrl,
                    coin: this.tx.coin,
                    payload,
                    disableLoader
                })
                    .then(payProDetails => {
                    this.tx.paypro = payProDetails;
                    this.paymentTimeControl(this.tx.paypro.expires);
                })
                    .catch(err => {
                    this.logger.warn('Error fetching this invoice: ', this.bwcErrorProvider.msg(err));
                    this.paymentExpired = true;
                    this.showErrorInfoSheet(this.bwcErrorProvider.msg(err), this.translate.instant('Error fetching this invoice'));
                });
            })
                .catch(err => {
                this.logger.warn('Error fetching this invoice: ', this.bwcErrorProvider.msg(err));
                this.showErrorInfoSheet(this.bwcErrorProvider.msg(err), this.translate.instant('Error fetching this invoice'));
            });
        }
    }
    paymentTimeControl(expires) {
        const expirationTime = Math.floor(new Date(expires).getTime() / 1000);
        let setExpirationTime = () => {
            let now = Math.floor(Date.now() / 1000);
            if (now > expirationTime) {
                this.paymentExpired = true;
                if (this.countDown)
                    clearInterval(this.countDown);
                return;
            }
            let totalSecs = expirationTime - now;
            let m = Math.floor(totalSecs / 60);
            let s = totalSecs % 60;
            this.expires = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
        };
        this.paymentExpired = false;
        setExpirationTime();
        this.countDown = setInterval(() => {
            setExpirationTime();
        }, 1000);
    }
    showErrorInfoSheet(error, title) {
        this.loading = false;
        if (!error)
            return;
        this.logger.warn('ERROR:', error);
        if (this.isCordova)
            this.slideButton.isConfirmed(false);
        if (error.message === 'FINGERPRINT_CANCELLED' ||
            error.message === 'PASSWORD_CANCELLED') {
            return;
        }
        if (error.message === 'WRONG_PASSWORD') {
            this.errorsProvider.showWrongEncryptPasswordError();
            return;
        }
        let infoSheetTitle = title ? title : this.translate.instant('Error');
        this.errorsProvider.showDefaultError(this.bwcErrorProvider.msg(error), infoSheetTitle);
    }
    sign() {
        this.loading = true;
        this.walletProvider
            .publishAndSign(this.wallet, this.tx)
            .then(() => {
            this.onGoingProcessProvider.clear();
            this.openFinishModal();
        })
            .catch(err => {
            this.onGoingProcessProvider.clear();
            this.showErrorInfoSheet(err, 'Could not send payment');
        });
    }
    reject() {
        let title = this.translate.instant('Warning!');
        let msg = this.translate.instant('Are you sure you want to reject this transaction?');
        this.popupProvider
            .ionicConfirm(title, msg, null, null)
            .then((res) => {
            if (!res)
                return;
            this.loading = true;
            this.onGoingProcessProvider.set('rejectTx');
            this.walletProvider
                .reject(this.wallet, this.tx)
                .then(() => {
                this.onGoingProcessProvider.clear();
                this.close();
            })
                .catch(err => {
                this.onGoingProcessProvider.clear();
                this.showErrorInfoSheet(err, this.translate.instant('Could not reject payment'));
            });
        });
    }
    remove() {
        let title = this.translate.instant('Warning!');
        let msg = this.translate.instant('Are you sure you want to remove this transaction?');
        this.popupProvider
            .ionicConfirm(title, msg, null, null)
            .then((res) => {
            if (!res)
                return;
            this.onGoingProcessProvider.set('removeTx');
            this.walletProvider
                .removeTx(this.wallet, this.tx)
                .then(() => {
                this.onGoingProcessProvider.clear();
                this.close();
            })
                .catch(err => {
                this.onGoingProcessProvider.clear();
                if (err && !(err.message && err.message.match(/Unexpected/))) {
                    this.showErrorInfoSheet(err, this.translate.instant('Could not delete payment proposal'));
                }
            });
        });
    }
    broadcast() {
        this.loading = true;
        this.onGoingProcessProvider.set('broadcastingTx');
        this.walletProvider
            .broadcastTx(this.wallet, this.tx)
            .then(() => {
            this.onGoingProcessProvider.clear();
            this.openFinishModal();
        })
            .catch(err => {
            this.onGoingProcessProvider.clear();
            this.showErrorInfoSheet(err, 'Could not broadcast payment');
            this.logger.error('Could not broadcast: ', this.tx.coin, this.tx.network, this.tx.raw);
        });
    }
    updateTxInfo(eventName) {
        this.walletProvider
            .getTxp(this.wallet, this.tx.id)
            .then(tx => {
            let action = _.find(tx.actions, {
                copayerId: this.wallet.credentials.copayerId
            });
            this.tx = this.txFormatProvider.processTx(this.wallet.coin, tx);
            if ((!action || action.type === 'failed') && tx.status == 'pending') {
                this.tx.pendingForUs = true;
                if (action.type === 'failed') {
                    this.executionPending = true;
                }
            }
            this.updateCopayerList();
            this.initActionList();
        })
            .catch(err => {
            if (err.message &&
                err.message == 'Transaction proposal not found' &&
                (eventName == 'transactionProposalRemoved' ||
                    eventName == 'TxProposalRemoved')) {
                this.tx.removed = true;
                this.tx.canBeRemoved = false;
                this.tx.pendingForUs = false;
            }
        });
    }
    updateCopayerList() {
        _.map(this.copayers, (cp) => {
            _.each(this.tx.actions, ac => {
                if (cp.id == ac.copayerId) {
                    cp.action = ac.type;
                }
            });
        });
    }
    onConfirm() {
        if (this.tx.multisigContractAddress) {
            this.goToConfirm();
        }
        else {
            this.sign();
        }
    }
    goToConfirm() {
        let amount = 0;
        this.viewCtrl.dismiss({
            walletId: this.wallet.credentials.walletId,
            amount,
            coin: this.wallet.coin,
            network: this.wallet.network,
            multisigContractAddress: this.wallet.credentials.multisigEthInfo
                .multisigContractAddress,
            toAddress: this.wallet.credentials.multisigEthInfo
                .multisigContractAddress,
            isEthMultisigConfirm: !this.executionPending ? true : false,
            isEthMultisigExecute: this.executionPending ? true : false,
            transactionId: this.tx.multisigTxId
        });
    }
    close() {
        this.loading = false;
        this.viewCtrl.dismiss();
    }
    openFinishModal() {
        let modal = this.modalCtrl.create(FinishModalPage, { finishText: this.successText }, { showBackdrop: true, enableBackdropDismiss: false });
        modal.present();
        modal.onDidDismiss(() => {
            this.close();
        });
    }
};
__decorate([
    ViewChild('slideButton'),
    __metadata("design:type", Object)
], TxpDetailsPage.prototype, "slideButton", void 0);
TxpDetailsPage = __decorate([
    Component({
        selector: 'page-txp-details',
        templateUrl: 'txp-details.html'
    }),
    __metadata("design:paramtypes", [NavParams,
        PlatformProvider,
        FeeProvider,
        Events,
        Logger,
        PopupProvider,
        WalletProvider,
        OnGoingProcessProvider,
        ViewController,
        ConfigProvider,
        CurrencyProvider,
        ProfileProvider,
        TxFormatProvider,
        TranslateService,
        ModalController,
        PayproProvider,
        BwcErrorProvider,
        ErrorsProvider])
], TxpDetailsPage);
export { TxpDetailsPage };
//# sourceMappingURL=txp-details.js.map