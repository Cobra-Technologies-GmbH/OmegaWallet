import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Events, ModalController, NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';
// Pages
import { CopayersPage } from '../../add/copayers/copayers';
import { ScanPage } from '../../scan/scan';
import { WalletDetailsPage } from '../../wallet-details/wallet-details';
// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { BwcErrorProvider } from '../../../providers/bwc-error/bwc-error';
import { BwcProvider } from '../../../providers/bwc/bwc';
import { ClipboardProvider } from '../../../providers/clipboard/clipboard';
import { ConfigProvider } from '../../../providers/config/config';
import { DerivationPathHelperProvider } from '../../../providers/derivation-path-helper/derivation-path-helper';
import { ErrorsProvider } from '../../../providers/errors/errors';
import { Logger } from '../../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../../providers/on-going-process/on-going-process';
import { ProfileProvider } from '../../../providers/profile/profile';
import { PushNotificationsProvider } from '../../../providers/push-notifications/push-notifications';
import { WalletProvider } from '../../../providers/wallet/wallet';
let JoinWalletPage = class JoinWalletPage {
    constructor(bwcErrorProvider, bwcProvider, configProvider, form, navCtrl, navParams, derivationPathHelperProvider, onGoingProcessProvider, profileProvider, walletProvider, logger, translate, events, pushNotificationsProvider, clipboardProvider, modalCtrl, errorsProvider, actionSheetProvider) {
        this.bwcErrorProvider = bwcErrorProvider;
        this.bwcProvider = bwcProvider;
        this.configProvider = configProvider;
        this.form = form;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.derivationPathHelperProvider = derivationPathHelperProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.profileProvider = profileProvider;
        this.walletProvider = walletProvider;
        this.logger = logger;
        this.translate = translate;
        this.events = events;
        this.pushNotificationsProvider = pushNotificationsProvider;
        this.clipboardProvider = clipboardProvider;
        this.modalCtrl = modalCtrl;
        this.errorsProvider = errorsProvider;
        this.actionSheetProvider = actionSheetProvider;
        this.updateCodeHandler = data => {
            if (this.coin.toLowerCase() == 'eth') {
                this.joinForm.controls['invitationCode'].setValue(data.value);
            }
            else {
                const invitationCode = data.value.replace('copay:', '');
                this.onQrCodeScannedJoin(invitationCode);
            }
        };
        this.okText = this.translate.instant('Ok');
        this.cancelText = this.translate.instant('Cancel');
        this.defaults = this.configProvider.getDefaults();
        this.showAdvOpts = false;
        this.keyId = this.navParams.data.keyId;
        this.coin = this.navParams.data.coin;
        this.regex = /^[0-9A-HJ-NP-Za-km-z]{70,80}$/; // For invitationCode
        this.joinForm = this.form.group({
            walletName: [null],
            myName: [null],
            invitationCode: [null],
            bwsURL: [this.defaults.bws.url],
            selectedSeed: ['new'],
            recoveryPhrase: [null],
            derivationPath: [null]
        });
        if (this.coin === 'eth') {
            this.joinForm.get('walletName').setValidators([Validators.required]);
            this.joinForm.controls['walletName'].setValue(this.translate.instant('ETH Multisig'));
            this.joinForm.get('invitationCode').setValidators([Validators.required]);
        }
        else {
            this.joinForm.get('myName').setValidators([Validators.required]);
            this.joinForm
                .get('invitationCode')
                .setValidators([Validators.required, Validators.pattern(this.regex)]);
        }
        this.seedOptions = [
            {
                id: 'new',
                label: this.translate.instant('Random'),
                supportsTestnet: true
            },
            {
                id: 'set',
                label: this.translate.instant('Specify Recovery Phrase'),
                supportsTestnet: false
            }
        ];
        this.events.subscribe('Local/JoinScan', this.updateCodeHandler);
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: JoinWalletPage');
    }
    ionViewWillEnter() {
        if (this.navParams.data.url) {
            let data = this.navParams.data.url;
            data = data.replace('copay:', '');
            this.onQrCodeScannedJoin(data);
        }
        if (this.coin.toLowerCase() == 'eth' && !this.pairedWallet) {
            this.showPairedWalletSelector();
        }
    }
    ngOnDestroy() {
        this.events.unsubscribe('Local/JoinScan', this.updateCodeHandler);
    }
    showPairedWalletSelector() {
        this.isOpenSelector = true;
        const eligibleWallets = this.keyId
            ? this.profileProvider.getWalletsFromGroup({
                keyId: this.keyId,
                coin: 'eth',
                m: 1,
                n: 1
            })
            : [];
        const walletSelector = this.actionSheetProvider.createInfoSheet('linkEthWallet', {
            wallets: eligibleWallets,
            isEthMultisig: true
        });
        walletSelector.present();
        walletSelector.onDidDismiss(pairedWallet => {
            this.isOpenSelector = false;
            if (!_.isEmpty(pairedWallet)) {
                this.pairedWallet = pairedWallet;
            }
        });
    }
    onQrCodeScannedJoin(data) {
        if (this.regex.test(data)) {
            this.joinForm.controls['invitationCode'].setValue(data);
            this.processInvitation(data);
        }
        else {
            this.errorsProvider.showDefaultError(this.translate.instant('Invalid data'), this.translate.instant('Error'));
        }
    }
    seedOptionsChange(seed) {
        if (seed === 'set') {
            this.joinForm.get('recoveryPhrase').setValidators([Validators.required]);
        }
        else {
            this.joinForm.get('recoveryPhrase').setValidators(null);
        }
        this.joinForm.controls['recoveryPhrase'].setValue(null);
        this.joinForm.controls['selectedSeed'].setValue(seed);
        this.processInvitation(this.joinForm.value.invitationCode);
    }
    setDerivationPath(network) {
        const path = network == 'testnet'
            ? this.derivationPathForTestnet
            : this.derivationPathByDefault;
        this.joinForm.controls['derivationPath'].setValue(path);
    }
    processInvitation(invitation) {
        if (this.regex.test(invitation)) {
            this.logger.info('Processing invitation code...');
            let walletData;
            try {
                walletData = this.bwcProvider.parseSecret(invitation);
                this.coin = walletData.coin;
                this.derivationPathForTestnet = this.derivationPathHelperProvider.defaultTestnet;
                this.derivationPathByDefault =
                    this.coin == 'bch'
                        ? this.derivationPathHelperProvider.defaultBCH
                        : this.derivationPathHelperProvider.defaultBTC;
                this.setDerivationPath(walletData.network);
                this.logger.info('Correct invitation code for ' + walletData.network);
            }
            catch (ex) {
                this.logger.warn('Error parsing invitation: ' + ex);
            }
        }
    }
    createAndBindMultisigWallet(pairedWallet, multisigEthInfo) {
        this.profileProvider
            .createMultisigEthWallet(pairedWallet, multisigEthInfo)
            .then(multisigWallet => {
            // store preferences for the paired eth wallet
            this.walletProvider.updateRemotePreferences(pairedWallet);
            this.navCtrl.popToRoot({ animate: false }).then(() => {
                if (multisigWallet) {
                    setTimeout(() => {
                        this.navCtrl.push(WalletDetailsPage, {
                            walletId: multisigWallet.credentials.walletId
                        });
                    }, 1000);
                }
            });
        });
    }
    setOptsAndJoin() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.coin === 'eth') {
                const multisigContractAddress = this.joinForm.value.invitationCode;
                const walletName = this.joinForm.value.walletName;
                const ownerAddress = yield this.walletProvider.getAddress(this.pairedWallet, false);
                let contractInfo;
                try {
                    contractInfo = yield this.walletProvider.getMultisigContractInfo(this.pairedWallet, {
                        multisigContractAddress
                    });
                }
                catch (error) {
                    this.logger.error('Multisig contract address not found', error.message);
                }
                if (!contractInfo) {
                    // show error multisig contract not found
                    const title = this.translate.instant('Error');
                    const subtitle = this.translate.instant('Multisig contract address not found.');
                    this.errorsProvider.showDefaultError(subtitle, title);
                }
                else if (!_.includes(contractInfo.owners, ownerAddress)) {
                    // show error multisig contract wrong owner
                    const title = this.translate.instant('Error');
                    const subtitle = this.translate.instant('The ethereum paired wallet you choose does not belong to this contract');
                    this.errorsProvider.showDefaultError(subtitle, title);
                }
                else {
                    const m = contractInfo.owners.length;
                    const n = Number(contractInfo.required);
                    this.createAndBindMultisigWallet(this.pairedWallet, {
                        multisigContractAddress,
                        walletName,
                        n,
                        m
                    });
                }
                return;
            }
            const opts = {
                keyId: this.keyId,
                secret: this.joinForm.value.invitationCode,
                myName: this.joinForm.value.myName,
                bwsurl: this.joinForm.value.bwsURL,
                coin: this.coin
            };
            const setSeed = this.joinForm.value.selectedSeed == 'set';
            if (setSeed) {
                const words = this.joinForm.value.recoveryPhrase;
                if (words.indexOf(' ') == -1 &&
                    words.indexOf('prv') == 1 &&
                    words.length > 108) {
                    opts.extendedPrivateKey = words;
                }
                else {
                    opts.mnemonic = words;
                }
                const derivationPath = this.joinForm.value.derivationPath;
                opts.networkName = this.derivationPathHelperProvider.getNetworkName(derivationPath);
                opts.derivationStrategy = this.derivationPathHelperProvider.getDerivationStrategy(derivationPath);
                opts.account = this.derivationPathHelperProvider.getAccount(derivationPath);
                // set opts.useLegacyPurpose
                if (this.derivationPathHelperProvider.parsePath(derivationPath).purpose ==
                    "44'") {
                    opts.useLegacyPurpose = true;
                    this.logger.debug('Using 44 for Multisig');
                }
                // set opts.useLegacyCoinType
                if (this.coin == 'bch' &&
                    this.derivationPathHelperProvider.parsePath(derivationPath).coinCode ==
                        "0'") {
                    opts.useLegacyCoinType = true;
                    this.logger.debug('Using 0 for BCH creation');
                }
                if (!opts.networkName ||
                    !opts.derivationStrategy ||
                    !Number.isInteger(opts.account)) {
                    const title = this.translate.instant('Error');
                    const subtitle = this.translate.instant('Invalid derivation path');
                    this.errorsProvider.showDefaultError(subtitle, title);
                    return;
                }
                if (!this.derivationPathHelperProvider.isValidDerivationPathCoin(this.joinForm.value.derivationPath, this.coin)) {
                    const title = this.translate.instant('Error');
                    const subtitle = this.translate.instant('Invalid derivation path for selected coin');
                    this.errorsProvider.showDefaultError(subtitle, title);
                    return;
                }
            }
            if (setSeed && !opts.mnemonic && !opts.extendedPrivateKey) {
                const title = this.translate.instant('Error');
                const subtitle = this.translate.instant('Please enter the wallet recovery phrase');
                this.errorsProvider.showDefaultError(subtitle, title);
                return;
            }
            this.join(opts);
        });
    }
    join(opts) {
        this.onGoingProcessProvider.set('joiningWallet');
        opts['keyId'] = this.keyId;
        this.profileProvider
            .joinWallet(opts)
            .then(wallet => {
            this.clipboardProvider.clearClipboardIfValidData(['JoinWallet']);
            this.onGoingProcessProvider.clear();
            this.walletProvider.updateRemotePreferences(wallet);
            this.pushNotificationsProvider.updateSubscription(wallet);
            this.navCtrl.popToRoot({ animate: false }).then(() => {
                setTimeout(() => {
                    if (wallet.isComplete()) {
                        this.navCtrl.push(WalletDetailsPage, {
                            walletId: wallet.credentials.walletId
                        });
                    }
                    else {
                        const copayerModal = this.modalCtrl.create(CopayersPage, {
                            walletId: wallet.credentials.walletId
                        }, {
                            cssClass: 'wallet-details-modal'
                        });
                        copayerModal.present();
                    }
                }, 1000);
            });
        })
            .catch(err => {
            this.onGoingProcessProvider.clear();
            const title = this.translate.instant('Error');
            this.errorsProvider.showDefaultError(this.bwcErrorProvider.msg(err), title);
            return;
        });
    }
    openScanner() {
        this.navCtrl.push(ScanPage, { fromJoin: true });
    }
};
JoinWalletPage = __decorate([
    Component({
        selector: 'page-join-wallet',
        templateUrl: 'join-wallet.html'
    }),
    __metadata("design:paramtypes", [BwcErrorProvider,
        BwcProvider,
        ConfigProvider,
        FormBuilder,
        NavController,
        NavParams,
        DerivationPathHelperProvider,
        OnGoingProcessProvider,
        ProfileProvider,
        WalletProvider,
        Logger,
        TranslateService,
        Events,
        PushNotificationsProvider,
        ClipboardProvider,
        ModalController,
        ErrorsProvider,
        ActionSheetProvider])
], JoinWalletPage);
export { JoinWalletPage };
//# sourceMappingURL=join-wallet.js.map