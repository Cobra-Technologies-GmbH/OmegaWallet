import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';
// Native
import { SocialSharing } from '@ionic-native/social-sharing';
// providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { ConfigProvider } from '../../../providers/config/config';
import { Coin, CurrencyProvider } from '../../../providers/currency/currency';
import { PlatformProvider } from '../../../providers/platform/platform';
import { ProfileProvider } from '../../../providers/profile/profile';
import { TxFormatProvider } from '../../../providers/tx-format/tx-format';
import { WalletProvider } from '../../../providers/wallet/wallet';
let CustomAmountPage = class CustomAmountPage {
    constructor(currencyProvider, navParams, profileProvider, platformProvider, walletProvider, logger, socialSharing, txFormatProvider, actionSheetProvider, configProvider) {
        this.currencyProvider = currencyProvider;
        this.navParams = navParams;
        this.profileProvider = profileProvider;
        this.platformProvider = platformProvider;
        this.walletProvider = walletProvider;
        this.logger = logger;
        this.socialSharing = socialSharing;
        this.txFormatProvider = txFormatProvider;
        this.actionSheetProvider = actionSheetProvider;
        this.configProvider = configProvider;
        const walletId = this.navParams.data.id;
        this.showShareButton = this.platformProvider.isCordova;
        this.useLegacyQrCode = this.configProvider.get().legacyQrCode.show;
        this.wallet = this.profileProvider.getWallet(walletId);
        this.walletProvider.getAddress(this.wallet, false).then(addr => {
            this.address = this.walletProvider.getAddressView(this.wallet.coin, this.wallet.network, addr);
            const parsedAmount = this.txFormatProvider.parseAmount(this.wallet.coin, this.navParams.data.amount, this.navParams.data.currency);
            // Amount in USD or BTC
            const _amount = parsedAmount.amount;
            const _currency = parsedAmount.currency;
            this.amountUnitStr = parsedAmount.amountUnitStr;
            if (!Coin[_currency]) {
                // Convert to BTC or BCH
                const amountUnit = this.txFormatProvider.satToUnit(parsedAmount.amountSat, this.wallet.coin);
                var btcParsedAmount = this.txFormatProvider.parseAmount(this.wallet.coin, amountUnit, this.wallet.coin.toUpperCase());
                this.amountCoin = btcParsedAmount.amount;
                this.altAmountStr = btcParsedAmount.amountUnitStr;
            }
            else {
                this.amountCoin = _amount; // BTC or BCH
                this.altAmountStr = this.txFormatProvider.formatAlternativeStr(this.wallet.coin, parsedAmount.amountSat);
            }
            let protoAddr;
            if (this.wallet.coin != 'bch') {
                protoAddr = this.walletProvider.getProtoAddress(this.wallet.coin, this.wallet.network, this.address);
            }
            if (this.currencyProvider.isUtxoCoin(this.wallet.coin) ||
                this.wallet.coin === 'xrp') {
                this.qrAddress =
                    (protoAddr ? protoAddr : this.address) + '?amount=' + this.amountCoin;
            }
            else {
                this.qrAddress =
                    (protoAddr ? protoAddr : this.address) +
                        '?value=' +
                        parsedAmount.amountSat;
            }
        });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CustomAmountPage');
    }
    shareAddress() {
        this.socialSharing.share(this.qrAddress);
    }
    showPaymentRequestInfo() {
        const infoSheet = this.actionSheetProvider.createInfoSheet('payment-request', {
            amount: this.amountUnitStr,
            name: this.wallet.name
        });
        infoSheet.present();
    }
};
CustomAmountPage = __decorate([
    Component({
        selector: 'page-custom-amount',
        templateUrl: 'custom-amount.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        NavParams,
        ProfileProvider,
        PlatformProvider,
        WalletProvider,
        Logger,
        SocialSharing,
        TxFormatProvider,
        ActionSheetProvider,
        ConfigProvider])
], CustomAmountPage);
export { CustomAmountPage };
//# sourceMappingURL=custom-amount.js.map