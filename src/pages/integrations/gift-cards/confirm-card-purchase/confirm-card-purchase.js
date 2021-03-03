import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { App, Events, ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Logger } from '../../../../providers/logger/logger';
// Pages
import { FinishModalPage } from '../../../finish/finish';
import { ConfirmPage } from '../../../send/confirm/confirm';
import { CardDetailsPage } from '../../gift-cards/card-details/card-details';
import { PurchasedCardsPage } from '../purchased-cards/purchased-cards';
// Provider
import { AddressProvider, AnalyticsProvider, EmailNotificationsProvider, FeeProvider, IABCardProvider, IncomingDataProvider, PersistenceProvider, TxConfirmNotificationProvider } from '../../../../providers';
import { ActionSheetProvider } from '../../../../providers/action-sheet/action-sheet';
import { AppProvider } from '../../../../providers/app/app';
import { BwcErrorProvider } from '../../../../providers/bwc-error/bwc-error';
import { BwcProvider } from '../../../../providers/bwc/bwc';
import { ClipboardProvider } from '../../../../providers/clipboard/clipboard';
import { CoinbaseProvider } from '../../../../providers/coinbase/coinbase';
import { ConfigProvider } from '../../../../providers/config/config';
import { CurrencyProvider } from '../../../../providers/currency/currency';
import { ErrorsProvider } from '../../../../providers/errors/errors';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { getActivationFee, getPromo, getVisibleDiscount, GiftCardProvider, hasVisibleDiscount } from '../../../../providers/gift-card/gift-card';
import { HomeIntegrationsProvider } from '../../../../providers/home-integrations/home-integrations';
import { OnGoingProcessProvider } from '../../../../providers/on-going-process/on-going-process';
import { PayproProvider } from '../../../../providers/paypro/paypro';
import { PlatformProvider } from '../../../../providers/platform/platform';
import { PopupProvider } from '../../../../providers/popup/popup';
import { ProfileProvider } from '../../../../providers/profile/profile';
import { ReplaceParametersProvider } from '../../../../providers/replace-parameters/replace-parameters';
import { TxFormatProvider } from '../../../../providers/tx-format/tx-format';
import { WalletConnectProvider } from '../../../../providers/wallet-connect/wallet-connect';
import { WalletProvider } from '../../../../providers/wallet/wallet';
let ConfirmCardPurchasePage = class ConfirmCardPurchasePage extends ConfirmPage {
    constructor(analyticsProvider, addressProvider, app, actionSheetProvider, bwcErrorProvider, bwcProvider, configProvider, currencyProvider, errorsProvider, feeProvider, giftCardProvider, incomingDataProvider, replaceParametersProvider, emailNotificationsProvider, externalLinkProvider, logger, modalCtrl, navCtrl, navParams, onGoingProcessProvider, popupProvider, profileProvider, txConfirmNotificationProvider, txFormatProvider, walletProvider, translate, payproProvider, platformProvider, clipboardProvider, events, coinbaseProvider, appProvider, iabCardProvider, homeIntegrationsProvider, persistenceProvider, WalletConnectProvider) {
        super(addressProvider, analyticsProvider, app, actionSheetProvider, bwcErrorProvider, bwcProvider, configProvider, currencyProvider, errorsProvider, externalLinkProvider, feeProvider, logger, modalCtrl, navCtrl, navParams, onGoingProcessProvider, platformProvider, profileProvider, popupProvider, replaceParametersProvider, translate, txConfirmNotificationProvider, txFormatProvider, walletProvider, clipboardProvider, events, coinbaseProvider, appProvider, payproProvider, iabCardProvider, homeIntegrationsProvider, persistenceProvider, WalletConnectProvider);
        this.giftCardProvider = giftCardProvider;
        this.incomingDataProvider = incomingDataProvider;
        this.emailNotificationsProvider = emailNotificationsProvider;
        this.displayNameIncludesGiftCard = false;
        this.configWallet = this.configProvider.get().wallet;
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.amount = this.navParams.data.amount;
            this.currency = this.navParams.data.currency;
            this.phone = this.navParams.get('phone');
            this.cardConfig = this.navParams.get('cardConfig');
            this.displayNameIncludesGiftCard = this.cardConfig.displayName
                .toLowerCase()
                .includes('gift card');
            this.onlyIntegers = this.cardConfig.currency === 'JPY';
            this.activationFee = getActivationFee(this.amount, this.cardConfig);
        });
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: ConfirmCardPurchasePage');
    }
    ionViewWillEnter() {
        this.isOpenSelector = false;
        this.navCtrl.swipeBackEnabled = false;
        this.network = this.giftCardProvider.getNetwork();
        const walletOptions = {
            onlyComplete: true,
            network: this.network,
            hasFunds: true
        };
        this.wallets = this.profileProvider.getWallets(Object.assign(Object.assign({}, walletOptions), { minFiatCurrency: { amount: this.amount, currency: this.currency } }));
        const pendingWallets = this.profileProvider.getWallets(Object.assign(Object.assign({}, walletOptions), { minPendingAmount: { amount: this.amount, currency: this.currency } }));
        this.showCoinbase =
            this.homeIntegrationsProvider.shouldShowInHome('coinbase') &&
                this.coinbaseProvider.isLinked();
        this.coinbaseAccounts =
            this.showCoinbase && this.network === 'livenet'
                ? this.coinbaseProvider.getAvailableAccounts(null, {
                    amount: this.amount,
                    currency: this.currency
                })
                : [];
        if (_.isEmpty(this.wallets) &&
            !_.isEmpty(pendingWallets) &&
            _.isEmpty(this.coinbaseAccounts)) {
            const subtitle = this.translate.instant('You do not have enough confirmed funds to make this payment. Please wait for your pending transactions to confirm.');
            const title = this.translate.instant('Not enough confirmed funds');
            this.errorsProvider.showDefaultError(subtitle, title);
            return;
        }
        else if (_.isEmpty(this.wallets) && _.isEmpty(this.coinbaseAccounts)) {
            this.errorsProvider.showNoWalletsAvailableInfo();
            return;
        }
        this.showWallets(); // Show wallet selector
    }
    logGiftCardPurchaseEvent(isSlideConfirmFinished, transactionCurrency, giftData) {
        if (!isSlideConfirmFinished) {
            this.giftCardProvider.logEvent('giftcards_purchase_start', {
                brand: this.cardConfig.name,
                transactionCurrency
            });
            this.giftCardProvider.logEvent('add_to_cart', {
                brand: this.cardConfig.name,
                category: 'giftCards'
            });
        }
        else {
            this.giftCardProvider.logEvent('giftcards_purchase_finish', {
                brand: this.cardConfig.name,
                transactionCurrency
            });
            this.giftCardProvider.logEvent('set_checkout_option', {
                transactionCurrency,
                checkout_step: 1
            });
            this.giftCardProvider.logEvent('purchase', {
                value: giftData.amount,
                items: [
                    {
                        name: this.cardConfig.name,
                        category: 'giftCards',
                        quantity: 1
                    }
                ]
            });
        }
    }
    cancel() {
        this.navCtrl.popToRoot();
    }
    checkFeeHigh(amount, fee) {
        if (this.isHighFee(amount, fee)) {
            this.showHighFeeSheet();
        }
    }
    openExternalLink(urlKey) {
        let url;
        let title;
        switch (urlKey) {
            case 'networkCost':
                url =
                    'https://support.bitpay.com/hc/en-us/articles/115002990803-Why-Am-I-Being-Charged-an-Additional-Network-Cost-on-My-BitPay-Invoice-';
                title = this.translate.instant('Network Cost');
                break;
            case 'minerFee':
                url =
                    'https://support.bitpay.com/hc/en-us/articles/115003393863-What-are-bitcoin-miner-fees-Why-are-miner-fees-so-high-';
                title = this.translate.instant('Miner Fee');
                break;
        }
        let message = this.translate.instant('This information is available at the website.');
        let okText = this.translate.instant('Open');
        let cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, true, title, message, okText, cancelText);
    }
    resetValues() {
        this.totalAmountStr = this.invoiceFee = this.networkFee = this.totalAmount = this.wallet = null;
        this.tx = this.message = this.invoiceId = null;
    }
    publishAndSign(wallet, txp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!wallet.canSign) {
                const err = this.translate.instant('No signing proposal: No private key');
                return Promise.reject(err);
            }
            yield this.walletProvider.publishAndSign(wallet, txp);
            return this.onGoingProcessProvider.clear();
        });
    }
    satToFiat(coin, sat) {
        return this.txFormatProvider.toFiat(coin, sat, this.currencyIsoCode, {
            rates: this.invoiceRates
        });
    }
    setTotalAmount(coin, invoiceFeeSat = 0, networkFeeSat = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoiceFee = yield this.satToFiat(coin, invoiceFeeSat);
            this.invoiceFee = Number(invoiceFee);
            const chain = this.currencyProvider.getChain(coin).toLowerCase();
            const networkFee = yield this.satToFiat(chain, networkFeeSat);
            this.networkFee = Number(networkFee);
            this.totalAmount =
                this.amount -
                    this.totalDiscount +
                    this.activationFee +
                    this.invoiceFee +
                    this.networkFee;
        });
    }
    isCryptoCurrencySupported(coin, invoice) {
        return ((invoice['supportedTransactionCurrencies'][coin] &&
            invoice['supportedTransactionCurrencies'][coin].enabled) ||
            false);
    }
    handleCreateInvoiceError(err) {
        let err_title = this.translate.instant('Error creating the invoice');
        let err_msg;
        const errMessage = err && ((err.error && err.error.message) || err.message);
        if ((errMessage && errMessage.match(/suspended/i)) ||
            errMessage === 'Gift card currently unavailable') {
            err_title = this.translate.instant('Service not available');
            err_msg = this.translate.instant(`${this.cardConfig.displayName} gift card purchases are not available at this time. Please try again later.`);
        }
        else if (errMessage) {
            err_msg = errMessage;
        }
        else {
            err_msg = this.translate.instant(`Unable to complete your purchase at this time. Please try again later.`);
        }
        throw {
            title: err_title,
            message: err_msg
        };
    }
    createInvoice(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cardOrder = yield this.giftCardProvider
                .createBitpayInvoice(data)
                .catch(err => {
                throw this.handleCreateInvoiceError(err);
            });
            const accessKey = cardOrder && cardOrder.accessKey;
            const totalDiscount = cardOrder && cardOrder.totalDiscount;
            if (!accessKey) {
                throw {
                    message: this.translate.instant('No access key defined')
                };
            }
            const invoice = yield this.giftCardProvider
                .getBitPayInvoice(cardOrder.invoiceId)
                .catch(() => {
                throw {
                    message: this.translate.instant('Could not get the invoice')
                };
            });
            return { invoice, accessKey, totalDiscount };
        });
    }
    createTx(wallet, invoice, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const COIN = wallet.coin.toUpperCase();
            const paymentCode = this.currencyProvider.getPaymentCode(wallet.coin);
            const protocolUrl = invoice.paymentCodes[COIN][paymentCode];
            const payProUrl = this.incomingDataProvider.getPayProUrl(protocolUrl);
            if (!payProUrl) {
                throw {
                    title: this.translate.instant('Error fetching this invoice'),
                    message: this.translate.instant('Invalid URL')
                };
            }
            const address = yield this.walletProvider.getAddress(wallet, false);
            const payload = {
                address
            };
            const details = yield this.payproProvider
                .getPayProDetails({ paymentUrl: payProUrl, coin: wallet.coin, payload })
                .catch(err => {
                throw {
                    title: this.translate.instant('Error fetching this invoice'),
                    message: err
                };
            });
            const { instructions } = details;
            const txp = {
                coin: wallet.coin,
                amount: _.sumBy(instructions, 'amount'),
                from: address,
                toAddress: instructions[0].toAddress,
                outputs: [],
                message,
                customData: {
                    giftCardName: this.cardConfig.name,
                    service: 'giftcards'
                },
                payProUrl,
                excludeUnconfirmedUtxos: this.configWallet.spendUnconfirmed ? false : true
            };
            for (const instruction of instructions) {
                txp.outputs.push({
                    toAddress: instruction.toAddress,
                    amount: instruction.amount,
                    message: instruction.message,
                    data: instruction.data
                });
            }
            if (wallet.coin === 'xrp' &&
                instructions &&
                instructions[0] &&
                instructions[0].outputs &&
                instructions[0].outputs[0] &&
                instructions[0].outputs[0].invoiceID) {
                txp.invoiceID = instructions[0].outputs[0].invoiceID;
            }
            if (wallet.credentials.token) {
                txp.tokenAddress = wallet.credentials.token.address;
            }
            if (this.wallet.credentials.multisigEthInfo) {
                txp.multisigContractAddress = this.wallet.credentials.multisigEthInfo.multisigContractAddress;
            }
            if (details.requiredFeeRate) {
                const requiredFeeRate = !this.currencyProvider.isUtxoCoin(wallet.coin)
                    ? details.requiredFeeRate
                    : Math.ceil(details.requiredFeeRate * 1000);
                txp.feePerKb = requiredFeeRate;
                this.logger.debug('Using merchant fee rate:' + txp.feePerKb);
            }
            else {
                txp.feeLevel = this.feeProvider.getCoinCurrentFeeLevel(wallet.coin);
            }
            txp['origToAddress'] = txp.toAddress;
            if (wallet.coin && wallet.coin == 'bch') {
                txp.toAddress = this.bitcoreCash.Address(txp.toAddress).toString(true);
                txp.outputs[0].toAddress = txp.toAddress;
            }
            return this.walletProvider.createTx(wallet, txp);
        });
    }
    redeemGiftCard(initialCard) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onGoingProcessProvider.set('buyingGiftCard');
            const card = yield this.giftCardProvider
                .createGiftCard(initialCard)
                .catch(() => (Object.assign(Object.assign({}, initialCard), { status: 'FAILURE' })));
            yield this.giftCardProvider.saveGiftCard(card);
            this.onGoingProcessProvider.clear();
            this.logger.debug('Saved new gift card with status: ' + card.status);
            this.logDiscountedPurchase();
            this.events.publish('GiftCards/GiftCardPurchased');
            this.finish(card);
        });
    }
    logDiscountedPurchase() {
        if (!getPromo(this.cardConfig))
            return;
        const params = Object.assign(Object.assign({}, this.giftCardProvider.getPromoEventParams(this.cardConfig)), { discounted: hasVisibleDiscount(this.cardConfig) ? true : false });
        this.giftCardProvider.logEvent('purchasedGiftCard', params);
    }
    promptEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cardConfig.emailRequired) {
                const notificationEmail = this.emailNotificationsProvider.getEmailIfEnabled();
                return Promise.resolve(notificationEmail);
            }
            const email = yield this.giftCardProvider.getUserEmail();
            if (email) {
                return Promise.resolve(email);
            }
            return this.setEmail();
        });
    }
    setEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            const emailComponent = this.actionSheetProvider.createEmailComponent();
            yield emailComponent.present();
            return new Promise(resolve => {
                emailComponent.onDidDismiss(email => {
                    if (email) {
                        if (!this.giftCardProvider.emailIsValid(email)) {
                            this.throwEmailRequiredError();
                        }
                        this.giftCardProvider.storeEmail(email);
                        resolve(email);
                    }
                    else {
                        this.throwEmailRequiredError();
                    }
                    this.isOpenSelector = false;
                });
            });
        });
    }
    throwEmailRequiredError() {
        const title = this.translate.instant('Error');
        const msg = this.translate.instant('An email address is required for this purchase.');
        this.onGoingProcessProvider.clear();
        this.showErrorInfoSheet(msg, title, true);
        throw new Error('email required');
    }
    initialize(wallet, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const COIN = wallet.coin.toUpperCase();
            this.currencyIsoCode = this.currency;
            const discount = getVisibleDiscount(this.cardConfig);
            const dataSrc = Object.assign({ amount: this.amount, currency: this.currency, discounts: discount ? [discount.code] : [], uuid: wallet.id, email, buyerSelectedTransactionCurrency: COIN, cardName: this.cardConfig.name }, (this.phone && { phone: this.phone }));
            this.onGoingProcessProvider.set('loadingTxInfo');
            const data = yield this.createInvoice(dataSrc).catch(err => {
                this.onGoingProcessProvider.clear();
                throw this.showErrorInfoSheet(err.message, err.title, true);
            });
            this.invoiceRates = lowercaseKeys(data.invoice.exchangeRates);
            const parsedAmount = this.txFormatProvider.parseAmount(wallet.coin, this.amount, this.currency, { onlyIntegers: this.onlyIntegers, rates: this.invoiceRates });
            this.amountUnitStr = parsedAmount.amountUnitStr;
            const invoice = data.invoice;
            const accessKey = data.accessKey;
            this.totalDiscount = data.totalDiscount || 0;
            const amountSat = invoice.paymentSubtotals[COIN];
            if (!this.isCryptoCurrencySupported(COIN, invoice)) {
                this.onGoingProcessProvider.clear();
                let msg = this.translate.instant('Purchases with this cryptocurrency are not enabled');
                this.showErrorInfoSheet(msg, null, true);
                return;
            }
            // Sometimes API does not return this element;
            invoice['minerFees'][COIN]['totalFee'] =
                invoice.minerFees[COIN].totalFee || 0;
            let invoiceFeeSat = invoice.minerFees[COIN].totalFee;
            this.message = this.replaceParametersProvider.replace(this.translate.instant(`{{amountUnitStr}} Gift Card`), { amountUnitStr: this.amountUnitStr });
            const ctxp = yield this.createTx(wallet, invoice, this.message).catch(err => {
                this.onGoingProcessProvider.clear();
                this.resetValues();
                throw this.showErrorInfoSheet(err.message, err.title);
            });
            this.onGoingProcessProvider.clear();
            // Save in memory
            this.tx = ctxp;
            this.invoiceId = invoice.id;
            const now = moment().unix() * 1000;
            this.tx.giftData = {
                currency: dataSrc.currency,
                date: now,
                amount: dataSrc.amount,
                uuid: dataSrc.uuid,
                accessKey,
                invoiceId: invoice.id,
                invoiceUrl: invoice.url,
                invoiceTime: invoice.invoiceTime,
                name: this.cardConfig.name
            };
            this.totalAmountStr = this.txFormatProvider.formatAmountStr(wallet.coin, ctxp.amount || amountSat);
            // Warn: fee too high
            if (this.currencyProvider.isUtxoCoin(wallet.coin)) {
                this.checkFeeHigh(Number(amountSat), Number(invoiceFeeSat) + Number(ctxp.fee));
            }
            this.setTotalAmount(wallet.coin, invoiceFeeSat, ctxp.fee);
            this.logGiftCardPurchaseEvent(false, COIN, dataSrc);
        });
    }
    initializeCoinbase(account, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const COIN = account.currency.code;
            this.currencyIsoCode = this.currency;
            const discount = getVisibleDiscount(this.cardConfig);
            const dataSrc = Object.assign({ amount: this.amount, currency: this.currency, discounts: discount ? [discount.code] : [], uuid: this.coinbaseProvider.coinbaseData.user.id, email, buyerSelectedTransactionCurrency: COIN, cardName: this.cardConfig.name }, (this.phone && { phone: this.phone }));
            this.onGoingProcessProvider.set('loadingTxInfo');
            const data = yield this.createInvoice(dataSrc).catch(err => {
                this.onGoingProcessProvider.clear();
                throw this.showErrorInfoSheet(err.message, err.title, true);
            });
            this.invoiceRates = lowercaseKeys(data.invoice.exchangeRates);
            const parsedAmount = this.txFormatProvider.parseAmount(COIN.toLowerCase(), this.amount, this.currency, { onlyIntegers: this.onlyIntegers, rates: this.invoiceRates });
            this.amountUnitStr = parsedAmount.amountUnitStr;
            const invoice = data.invoice;
            const accessKey = data.accessKey;
            this.totalDiscount = data.totalDiscount || 0;
            const amountSat = invoice.paymentSubtotals[COIN];
            if (!this.isCryptoCurrencySupported(COIN, invoice)) {
                this.onGoingProcessProvider.clear();
                let msg = this.translate.instant('Purchases with this cryptocurrency are not enabled');
                this.showErrorInfoSheet(msg, null, true);
                return;
            }
            // Sometimes API does not return this element;
            invoice['minerFees'][COIN]['totalFee'] =
                invoice.minerFees[COIN].totalFee || 0;
            this.message = this.replaceParametersProvider.replace(this.translate.instant(`{{amountUnitStr}} Gift Card`), { amountUnitStr: this.amountUnitStr });
            this.onGoingProcessProvider.clear();
            // Save in memory
            this.tx = {};
            this.invoiceId = invoice.id;
            const now = moment().unix() * 1000;
            this.tx.giftData = {
                currency: dataSrc.currency,
                date: now,
                amount: dataSrc.amount,
                uuid: dataSrc.uuid,
                accessKey,
                invoiceId: invoice.id,
                invoiceUrl: invoice.url,
                invoiceTime: invoice.invoiceTime,
                name: this.cardConfig.name
            };
            this.totalAmountStr = this.txFormatProvider.formatAmountStr(COIN.toLowerCase(), amountSat);
            this.setTotalAmount(COIN.toLowerCase());
            this.logGiftCardPurchaseEvent(false, COIN, dataSrc);
        });
    }
    buyConfirm() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tx) {
                this.showErrorInfoSheet(this.translate.instant('Transaction has not been created'));
                return;
            }
            yield this.giftCardProvider.saveGiftCard(Object.assign(Object.assign({}, this.tx.giftData), { status: 'UNREDEEMED' }));
            if (this.wallet) {
                return this.publishAndSign(this.wallet, this.tx)
                    .then(() => {
                    this.redeemGiftCard(this.tx.giftData);
                    this.logGiftCardPurchaseEvent(true, this.wallet.coin.toUpperCase(), this.tx.giftData);
                })
                    .catch((err) => __awaiter(this, void 0, void 0, function* () { return this.handlePurchaseError(err); }));
            }
            else {
                return this.payWithCoinbaseAccount();
            }
        });
    }
    payWithCoinbaseAccount(code) {
        this.onGoingProcessProvider.set('payingWithCoinbase');
        return this.coinbaseProvider
            .payInvoice(this.tx.giftData.invoiceId, this.coinbaseAccount.currency.code, code)
            .then(() => {
            this.onGoingProcessProvider.clear();
            this.redeemGiftCard(this.tx.giftData);
            this.logGiftCardPurchaseEvent(true, this.coinbaseAccount.currency.code, this.tx.giftData);
        })
            .catch(err => {
            this.onGoingProcessProvider.clear();
            if (err == '2fa') {
                const message = this.translate.instant('Enter 2-step verification');
                const opts = {
                    type: 'number',
                    enableBackdropDismiss: false
                };
                this.popupProvider.ionicPrompt(null, message, opts).then(res => {
                    if (res === null) {
                        this.showErrorAndBack(this.translate.instant('Missing 2-step verification'));
                        return;
                    }
                    this.payWithCoinbaseAccount(res);
                });
            }
            else {
                this.showErrorAndBack(err);
            }
        });
    }
    showErrorAndBack(err) {
        if (this.isCordova)
            this.slideButton.isConfirmed(false);
        this.logger.error(err);
        err = err.errors ? err.errors[0].message : err;
        this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
    }
    handlePurchaseError(err) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onGoingProcessProvider.clear();
            yield this.giftCardProvider.saveCard(this.tx.giftData, {
                remove: true
            });
            yield this.walletProvider.removeTx(this.wallet, this.tx);
            const errorMessage = err && err.message;
            const canceledErrors = ['FINGERPRINT_CANCELLED', 'PASSWORD_CANCELLED'];
            if (canceledErrors.indexOf(errorMessage) !== -1) {
                return;
            }
            if (['NO_PASSWORD', 'WRONG_PASSWORD'].indexOf(errorMessage) === -1) {
                this.resetValues();
            }
            this.showErrorInfoSheet(this.bwcErrorProvider.msg(err), this.translate.instant('Could not send transaction'));
        });
    }
    onWalletSelect(option) {
        return __awaiter(this, void 0, void 0, function* () {
            if (option.isCoinbaseAccount) {
                this.wallet = null;
                this.coinbaseAccount = option.accountSelected;
                const email = this.coinbaseProvider.coinbaseData.user.email;
                yield this.initializeCoinbase(option.accountSelected, email).catch(() => { });
            }
            else {
                this.wallet = option;
                this.coinbaseAccount = null;
                this.isERCToken = this.currencyProvider.isERCToken(this.wallet.coin);
                const email = yield this.promptEmail();
                yield this.initialize(option, email).catch(() => { });
            }
        });
    }
    showWallets() {
        this.isOpenSelector = true;
        let id = this.wallet ? this.wallet.credentials.walletId : null;
        let coinbaseData = { user: [], availableAccounts: [] };
        if (this.showCoinbase) {
            const minFiatCurrency = { amount: this.amount, currency: this.currency };
            coinbaseData = {
                user: this.coinbaseProvider.coinbaseData.user,
                availableAccounts: this.coinbaseProvider.getAvailableAccounts(null, minFiatCurrency)
            };
        }
        const params = {
            wallets: this.wallets,
            selectedWalletId: id,
            title: this.translate.instant('Buy from'),
            coinbaseData
        };
        const walletSelector = this.actionSheetProvider.createWalletSelector(params);
        walletSelector.present();
        walletSelector.onDidDismiss(option => {
            if (!_.isEmpty(option))
                this.onWalletSelect(option);
            this.isOpenSelector = false;
        });
    }
    finish(card) {
        return __awaiter(this, void 0, void 0, function* () {
            card.status === 'SUCCESS'
                ? yield this.showCard(card)
                : yield this.showStatusModalAndPrepCard(card);
        });
    }
    showCard(card) {
        return __awaiter(this, void 0, void 0, function* () {
            const modal = this.modalCtrl.create(CardDetailsPage, {
                card,
                showConfetti: card.status === 'SUCCESS',
                showCloseButton: true
            });
            yield modal.present();
            yield this.resetNav(card);
        });
    }
    showStatusModalAndPrepCard(card) {
        return __awaiter(this, void 0, void 0, function* () {
            let finishComment;
            let cssClass;
            if (card.status == 'FAILURE') {
                finishComment = this.translate.instant('Your purchase could not be completed.');
                cssClass = 'danger';
            }
            if (card.status == 'PENDING') {
                finishComment = this.translate.instant('Your purchase is pending.');
                cssClass = 'warning';
            }
            let finishText = '';
            let modal = this.modalCtrl.create(FinishModalPage, { finishText, finishComment, cssClass }, { showBackdrop: true, enableBackdropDismiss: false });
            yield modal.present();
            yield this.resetNav(card);
            yield this.navCtrl.push(CardDetailsPage, { card }, { animate: false });
        });
    }
    resetNav(card) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.navCtrl.popToRoot({ animate: false });
            const numActiveCards = yield this.getNumActiveCards();
            if (numActiveCards > 1) {
                yield this.navCtrl.push(PurchasedCardsPage, { cardName: card.name }, { animate: false });
            }
        });
    }
    getNumActiveCards() {
        return __awaiter(this, void 0, void 0, function* () {
            const allGiftCards = yield this.giftCardProvider.getPurchasedCards(this.cardConfig.name);
            const currentGiftCards = allGiftCards.filter(c => !c.archived);
            return currentGiftCards.length;
        });
    }
};
ConfirmCardPurchasePage = __decorate([
    Component({
        selector: 'confirm-card-purchase-page',
        templateUrl: 'confirm-card-purchase.html'
    }),
    __metadata("design:paramtypes", [AnalyticsProvider,
        AddressProvider,
        App,
        ActionSheetProvider,
        BwcErrorProvider,
        BwcProvider,
        ConfigProvider,
        CurrencyProvider,
        ErrorsProvider,
        FeeProvider,
        GiftCardProvider,
        IncomingDataProvider,
        ReplaceParametersProvider,
        EmailNotificationsProvider,
        ExternalLinkProvider,
        Logger,
        ModalController,
        NavController,
        NavParams,
        OnGoingProcessProvider,
        PopupProvider,
        ProfileProvider,
        TxConfirmNotificationProvider,
        TxFormatProvider,
        WalletProvider,
        TranslateService,
        PayproProvider,
        PlatformProvider,
        ClipboardProvider,
        Events,
        CoinbaseProvider,
        AppProvider,
        IABCardProvider,
        HomeIntegrationsProvider,
        PersistenceProvider,
        WalletConnectProvider])
], ConfirmCardPurchasePage);
export { ConfirmCardPurchasePage };
function lowercaseKeys(obj) {
    return Object.keys(obj).reduce((destination, key) => {
        destination[key.toLowerCase()] = obj[key];
        return destination;
    }, {});
}
//# sourceMappingURL=confirm-card-purchase.js.map