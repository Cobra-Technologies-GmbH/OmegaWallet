import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
// Providers
import { AddressProvider } from '../../providers/address/address';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ConfigProvider } from '../../providers/config/config';
import { CurrencyProvider } from '../../providers/currency/currency';
import { Logger } from '../../providers/logger/logger';
import { WalletProvider } from '../../providers/wallet/wallet';
import { Events, Platform } from 'ionic-angular';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { InfoSheetComponent } from '../../components/info-sheet/info-sheet';
import { DomProvider } from '../../providers/dom/dom';
let WalletReceiveComponent = class WalletReceiveComponent extends ActionSheetParent {
    constructor(logger, walletProvider, events, bwcErrorProvider, platform, currencyProvider, addressProvider, domProvider, configProvider) {
        super();
        this.logger = logger;
        this.walletProvider = walletProvider;
        this.events = events;
        this.bwcErrorProvider = bwcErrorProvider;
        this.platform = platform;
        this.currencyProvider = currencyProvider;
        this.addressProvider = addressProvider;
        this.domProvider = domProvider;
        this.configProvider = configProvider;
        this.retryCount = 0;
        this.bwsEventHandler = (walletId, type, n) => {
            if (this.wallet.credentials.walletId == walletId &&
                type == 'NewIncomingTx' &&
                n.data) {
                let addr = this.address.indexOf(':') > -1
                    ? this.address.split(':')[1]
                    : this.address;
                if (n.data.address == addr)
                    this.setAddress(true);
            }
        };
    }
    ngOnInit() {
        this.wallet = this.params.wallet;
        this.useLegacyQrCode = this.configProvider.get().legacyQrCode.show;
        this.bchAddrFormat = 'cashAddress';
        this.disclaimerAccepted = false;
        this.setAddress();
    }
    ionViewWillLeave() {
        this.onResumeSubscription.unsubscribe();
        this.events.unsubscribe('bwsEvent', this.bwsEventHandler);
    }
    ionViewWillEnter() {
        this.events.subscribe('bwsEvent', this.bwsEventHandler);
        this.onResumeSubscription = this.platform.resume.subscribe(() => {
            this.setAddress();
            this.events.subscribe('bwsEvent', this.bwsEventHandler);
        });
    }
    setAddress(newAddr, failed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.wallet ||
                !this.wallet.isComplete() ||
                (this.wallet.needsBackup && this.wallet.network == 'livenet'))
                return;
            this.loading = newAddr || _.isEmpty(this.address) ? true : false;
            this.walletProvider
                .getAddress(this.wallet, newAddr)
                .then(addr => {
                this.newAddressError = false;
                this.loading = false;
                if (!addr)
                    return;
                const address = this.walletProvider.getAddressView(this.wallet.coin, this.wallet.network, addr);
                if (this.address && this.address != address) {
                    this.playAnimation = true;
                }
                if (this.wallet.coin === 'bch')
                    this.bchCashAddress = address;
                this.updateQrAddress(address, newAddr);
            })
                .catch(err => {
                this.logger.warn('Retrying to create new adress:' + ++this.retryCount);
                if (this.retryCount > 3) {
                    this.retryCount = 0;
                    this.loading = false;
                    this.dismiss(err);
                }
                else if (err == 'INVALID_ADDRESS') {
                    // Generate new address if the first one is invalid ( fix for concatenated addresses )
                    if (!failed) {
                        this.setAddress(newAddr, true);
                        this.logger.warn(this.bwcErrorProvider.msg(err, 'Receive'));
                        return;
                    }
                    this.setAddress(false); // failed to generate new address -> get last saved address
                }
                else {
                    this.setAddress(false); // failed to generate new address -> get last saved address
                }
                this.logger.warn(this.bwcErrorProvider.msg(err, 'Receive'));
            });
        });
    }
    updateQrAddress(address, newAddr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.wallet.coin === 'bch') {
                address =
                    this.bchAddrFormat === 'legacy'
                        ? this.addressProvider.getLegacyBchAddressFormat(this.bchCashAddress)
                        : this.bchCashAddress;
            }
            if (newAddr) {
                yield Observable.timer(400).toPromise();
            }
            this.address = address;
            yield Observable.timer(200).toPromise();
            this.playAnimation = false;
        });
    }
    setQrAddress() {
        if (this.bchAddrFormat === 'legacy')
            this.showFirstWarning();
        else {
            this.disclaimerAccepted = false;
            this.updateQrAddress(this.bchCashAddress, false);
        }
    }
    createInfoSheet(type, params) {
        return this.setupSheet(InfoSheetComponent, type, params)
            .instance;
    }
    setupSheet(componentType, sheetType, params) {
        const sheet = this.domProvider.appendComponentToBody(componentType);
        sheet.instance.componentRef = sheet;
        sheet.instance.sheetType = sheetType;
        sheet.instance.params = params;
        return sheet;
    }
    showFirstWarning() {
        const infoSheet = this.createInfoSheet('bch-legacy-warning-1');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                this.showSecondWarning();
            }
            else {
                this.disclaimerAccepted = false;
                this.bchAddrFormat = 'cashAddress';
            }
        });
    }
    showSecondWarning() {
        const infoSheet = this.createInfoSheet('bch-legacy-warning-2');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                const legacyAddr = this.addressProvider.getLegacyBchAddressFormat(this.bchCashAddress);
                this.disclaimerAccepted = true;
                this.updateQrAddress(legacyAddr, false);
            }
            else {
                this.disclaimerAccepted = false;
                this.bchAddrFormat = 'cashAddress';
            }
        });
    }
};
WalletReceiveComponent = __decorate([
    Component({
        selector: 'wallet-receive',
        templateUrl: 'wallet-receive.html'
    }),
    __metadata("design:paramtypes", [Logger,
        WalletProvider,
        Events,
        BwcErrorProvider,
        Platform,
        CurrencyProvider,
        AddressProvider,
        DomProvider,
        ConfigProvider])
], WalletReceiveComponent);
export { WalletReceiveComponent };
//# sourceMappingURL=wallet-receive.js.map