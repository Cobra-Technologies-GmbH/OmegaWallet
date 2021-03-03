import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { ChooseFeeLevelComponent } from '../../components/choose-fee-level/choose-fee-level';
import { EmailComponent } from '../../components/email-component/email-component';
import { EncryptPasswordComponent } from '../../components/encrypt-password/encrypt-password';
import { IncomingDataMenuComponent } from '../../components/incoming-data-menu/incoming-data-menu';
import { InfoSheetComponent } from '../../components/info-sheet/info-sheet';
import { MemoComponent } from '../../components/memo-component/memo-component';
import { NeedsBackupComponent } from '../../components/needs-backup/needs-backup';
import { OptionsSheetComponent } from '../../components/options-sheet/options-sheet';
import { PhoneSheet } from '../../components/phone-sheet/phone-sheet';
import { WalletReceiveComponent } from '../../components/wallet-receive/wallet-receive';
import { WalletSelectorComponent } from '../../components/wallet-selector/wallet-selector';
import { WalletTabOptionsComponent } from '../../components/wallet-tab-options/wallet-tab-options';
import { DomProvider } from '../../providers/dom/dom';
let ActionSheetProvider = class ActionSheetProvider {
    constructor(domProvider) {
        this.domProvider = domProvider;
    }
    createOptionsSheet(type, params) {
        return this.setupSheet(OptionsSheetComponent, type, params).instance;
    }
    createIncomingDataMenu(params) {
        return this.setupSheet(IncomingDataMenuComponent, null, params).instance;
    }
    createInfoSheet(type, params) {
        return this.setupSheet(InfoSheetComponent, type, params)
            .instance;
    }
    createMemoComponent(memo) {
        return this.setupSheet(MemoComponent, null, { memo })
            .instance;
    }
    createEmailComponent() {
        return this.setupSheet(EmailComponent).instance;
    }
    createPhoneSheet(params) {
        return this.setupSheet(PhoneSheet, null, params).instance;
    }
    createWalletSelector(params) {
        return this.setupSheet(WalletSelectorComponent, null, params).instance;
    }
    createWalletReceive(params) {
        return this.setupSheet(WalletReceiveComponent, null, params).instance;
    }
    createNeedsBackup() {
        return this.setupSheet(NeedsBackupComponent, null)
            .instance;
    }
    createChooseFeeLevel(params) {
        return this.setupSheet(ChooseFeeLevelComponent, null, params).instance;
    }
    createWalletTabOptions(params) {
        return this.setupSheet(WalletTabOptionsComponent, null, params).instance;
    }
    createEncryptPasswordComponent() {
        return this.setupSheet(EncryptPasswordComponent)
            .instance;
    }
    setupSheet(componentType, sheetType, params) {
        const sheet = this.domProvider.appendComponentToBody(componentType);
        sheet.instance.componentRef = sheet;
        sheet.instance.sheetType = sheetType;
        sheet.instance.params = params;
        return sheet;
    }
};
ActionSheetProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DomProvider])
], ActionSheetProvider);
export { ActionSheetProvider };
//# sourceMappingURL=action-sheet.js.map