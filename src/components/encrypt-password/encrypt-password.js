import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InfoSheetComponent } from '../../components/info-sheet/info-sheet';
import { AppProvider } from '../../providers/app/app';
import { DomProvider } from '../../providers/dom/dom';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let EncryptPasswordComponent = class EncryptPasswordComponent extends ActionSheetParent {
    constructor(domProvider, fb, appProvider) {
        super();
        this.domProvider = domProvider;
        this.fb = fb;
        this.appProvider = appProvider;
        this.passwordInputType = 'password';
        this.confirmPasswordInputType = 'password';
        this.isCopay = this.appProvider.info.name === 'copay';
        this.encryptPasswordForm = this.fb.group({
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        }, { validator: this.matchingPasswords('password', 'confirmPassword') });
    }
    matchingPasswords(passwordKey, confirmPasswordKey) {
        return (group) => {
            const password = group.controls[passwordKey];
            const confirmPassword = group.controls[confirmPasswordKey];
            if (password.value !== confirmPassword.value) {
                return {
                    mismatchedPasswords: true
                };
            }
            return undefined;
        };
    }
    showInfoSheet() {
        const infoSheet = this.createInfoSheet('encrypt-password-warning');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option) {
                this.dismiss();
            }
        });
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
    next() {
        this.showForm = true;
    }
    confirm(password) {
        this.dismiss(password);
    }
};
EncryptPasswordComponent = __decorate([
    Component({
        selector: 'encrypt-password',
        templateUrl: 'encrypt-password.html'
    }),
    __metadata("design:paramtypes", [DomProvider,
        FormBuilder,
        AppProvider])
], EncryptPasswordComponent);
export { EncryptPasswordComponent };
//# sourceMappingURL=encrypt-password.js.map