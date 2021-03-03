import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../../../providers/logger/logger';
// providers
import { BwcErrorProvider } from '../../../../../providers/bwc-error/bwc-error';
import { PopupProvider } from '../../../../../providers/popup/popup';
import { ProfileProvider } from '../../../../../providers/profile/profile';
import { TxFormatProvider } from '../../../../../providers/tx-format/tx-format';
import { WalletProvider } from '../../../../../providers/wallet/wallet';
// pages
import { WalletDetailsPage } from '../../../../wallet-details/wallet-details';
import { AllAddressesPage } from './all-addresses/all-addresses';
import * as _ from 'lodash';
let WalletAddressesPage = class WalletAddressesPage {
    constructor(profileProvider, walletProvider, navCtrl, navParams, logger, bwcErrorProvider, popupProvider, modalCtrl, txFormatProvider, translate) {
        this.profileProvider = profileProvider;
        this.walletProvider = walletProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.logger = logger;
        this.bwcErrorProvider = bwcErrorProvider;
        this.popupProvider = popupProvider;
        this.modalCtrl = modalCtrl;
        this.txFormatProvider = txFormatProvider;
        this.translate = translate;
        this.UNUSED_ADDRESS_LIMIT = 5;
        this.BALANCE_ADDRESS_LIMIT = 5;
        this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
        this.withBalance = null;
        this.noBalance = null;
    }
    ionViewWillEnter() {
        this.loading = true;
        this.walletProvider
            .getMainAddresses(this.wallet, {
            doNotVerify: true
        })
            .then(allAddresses => {
            const { token, multisigEthInfo } = this.wallet.credentials;
            this.walletProvider
                .getBalance(this.wallet, {
                tokenAddress: token ? token.address : '',
                multisigContractAddress: multisigEthInfo
                    ? multisigEthInfo.multisigContractAddress
                    : ''
            })
                .then(resp => {
                this.withBalance = resp.byAddress;
                const idx = _.keyBy(this.withBalance, 'address');
                this.noBalance = _.reject(allAddresses, x => {
                    return idx[x.address];
                });
                this.processList(this.noBalance);
                this.processList(this.withBalance);
                this.latestUnused = _.slice(this.noBalance, 0, this.UNUSED_ADDRESS_LIMIT);
                this.latestWithBalance = _.slice(this.withBalance, 0, this.BALANCE_ADDRESS_LIMIT);
                this.viewAll =
                    this.noBalance.length > this.UNUSED_ADDRESS_LIMIT ||
                        this.withBalance.length > this.BALANCE_ADDRESS_LIMIT;
                this.loading = false;
            })
                .catch(err => {
                this.logger.error(err);
                this.loading = false;
                this.popupProvider.ionicAlert(this.bwcErrorProvider.msg(err, this.translate.instant('Could not update wallet')));
            });
        })
            .catch(err => {
            this.logger.error(err);
            this.loading = false;
            this.popupProvider.ionicAlert(this.bwcErrorProvider.msg(err, this.translate.instant('Could not update wallet')));
        });
        this.walletProvider
            .getLowUtxos(this.wallet)
            .then(resp => {
            if (resp && resp.allUtxos && resp.allUtxos.length) {
                const allSum = _.sumBy(resp.allUtxos || 0, 'satoshis');
                const per = (resp.minFee / allSum) * 100;
                this.lowUtxosNb = resp.lowUtxos.length;
                this.allUtxosNb = resp.allUtxos.length;
                this.lowUtxosSum = this.txFormatProvider.formatAmountStr(this.wallet.coin, _.sumBy(resp.lowUtxos || 0, 'satoshis'));
                this.allUtxosSum = this.txFormatProvider.formatAmountStr(this.wallet.coin, allSum);
                this.minFee = this.txFormatProvider.formatAmountStr(this.wallet.coin, resp.minFee || 0);
                this.minFeePer = per.toFixed(2) + '%';
            }
        })
            .catch(err => {
            this.logger.warn('GetLowUtxos', err);
        });
    }
    processList(list) {
        _.each(list, n => {
            n.path = n.path ? n.path.replace(/^m/g, 'xpub') : null;
            n.address = this.walletProvider.getAddressView(this.wallet.coin, this.wallet.network, n.address);
        });
    }
    viewAllAddresses() {
        const modal = this.modalCtrl.create(AllAddressesPage, {
            noBalance: this.noBalance,
            withBalance: this.withBalance,
            coin: this.wallet.coin,
            walletName: this.wallet.name
        });
        modal.present();
    }
    scan() {
        this.walletProvider.startScan(this.wallet);
        this.navCtrl.popToRoot().then(() => {
            setTimeout(() => {
                this.navCtrl.push(WalletDetailsPage, {
                    walletId: this.wallet.credentials.walletId
                });
            }, 1000);
        });
    }
};
WalletAddressesPage = __decorate([
    Component({
        selector: 'page-wallet-addresses',
        templateUrl: 'wallet-addresses.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        WalletProvider,
        NavController,
        NavParams,
        Logger,
        BwcErrorProvider,
        PopupProvider,
        ModalController,
        TxFormatProvider,
        TranslateService])
], WalletAddressesPage);
export { WalletAddressesPage };
//# sourceMappingURL=wallet-addresses.js.map