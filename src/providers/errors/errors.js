import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
// providers
import { ActionSheetProvider } from '../../providers/action-sheet/action-sheet';
import { Logger } from '../../providers/logger/logger';
let ErrorsProvider = class ErrorsProvider {
    constructor(actionSheetProvider, logger) {
        this.actionSheetProvider = actionSheetProvider;
        this.logger = logger;
        this.logger.debug('ErrorsProvider initialized');
    }
    showWrongEncryptPasswordError() {
        this.logger.warn('Wrong encrypt password');
        const errorInfoSheet = this.actionSheetProvider.createInfoSheet('wrong-encrypt-password');
        errorInfoSheet.present();
    }
    showDefaultError(err, infoSheetTitle, dismissFunction) {
        if (!err)
            return;
        const errorInfoSheet = this.actionSheetProvider.createInfoSheet('default-error', { msg: err, title: infoSheetTitle });
        errorInfoSheet.present();
        errorInfoSheet.onDidDismiss(dismissFunction);
    }
    showNoWalletsAvailableInfo(dismissFunction) {
        this.logger.warn('No wallets available');
        const errorInfoSheet = this.actionSheetProvider.createInfoSheet('no-wallets-available');
        errorInfoSheet.present();
        errorInfoSheet.onDidDismiss(dismissFunction);
    }
    showNoWalletError(coin, dismissFunction) {
        this.logger.warn('No wallets able to receive funds');
        const errorInfoSheet = this.actionSheetProvider.createInfoSheet('no-wallets-error', { coin });
        errorInfoSheet.present();
        errorInfoSheet.onDidDismiss(dismissFunction);
    }
};
ErrorsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ActionSheetProvider,
        Logger])
], ErrorsProvider);
export { ErrorsProvider };
//# sourceMappingURL=errors.js.map