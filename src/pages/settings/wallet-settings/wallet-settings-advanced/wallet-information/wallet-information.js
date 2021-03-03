import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// providers
import { CurrencyProvider } from '../../../../../providers/currency/currency';
import { Logger } from '../../../../../providers/logger/logger';
import { ProfileProvider } from '../../../../../providers/profile/profile';
let WalletInformationPage = class WalletInformationPage {
    constructor(profileProvider, currencyProvider, navParams, logger) {
        this.profileProvider = profileProvider;
        this.currencyProvider = currencyProvider;
        this.navParams = navParams;
        this.logger = logger;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded:  WalletInformationPage');
    }
    ionViewWillEnter() {
        this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
        this.walletName = this.wallet.name;
        this.coin = this.wallet.coin.toUpperCase();
        this.unitToSatoshi = this.currencyProvider.getPrecision(this.wallet.coin).unitToSatoshi;
        this.walletId = this.wallet.credentials.walletId;
        this.N = this.wallet.credentials.n;
        this.M = this.wallet.credentials.m;
        if (!_.isEmpty(this.wallet.cachedStatus)) {
            this.copayers = this.wallet.cachedStatus.wallet.copayers;
        }
        this.copayerId = this.wallet.credentials.copayerId;
        this.balanceByAddress = this.wallet.balanceByAddress;
        this.account = this.wallet.credentials.account;
        this.network = this.wallet.credentials.network;
        this.addressType = this.wallet.credentials.addressType || 'P2SH';
        this.rootPath = this.wallet.credentials.rootPath;
        this.pubKeys = _.map(this.wallet.credentials.publicKeyRing, 'xPubKey');
        this.externalSource = null;
        this.canSign = this.wallet.canSign;
        this.linkedEthWalletName = this.wallet.linkedEthWalletName;
    }
    isUtxoCoin() {
        return this.currencyProvider.isUtxoCoin(this.wallet.coin);
    }
};
WalletInformationPage = __decorate([
    Component({
        selector: 'page-wallet-information',
        templateUrl: 'wallet-information.html'
    }),
    __metadata("design:paramtypes", [ProfileProvider,
        CurrencyProvider,
        NavParams,
        Logger])
], WalletInformationPage);
export { WalletInformationPage };
//# sourceMappingURL=wallet-information.js.map