import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
// Providers
import { AppProvider } from '../../providers/app/app';
import { BwcProvider } from '../../providers/bwc/bwc';
import { DownloadProvider } from '../../providers/download/download';
import { ProfileProvider } from '../../providers/profile/profile';
import { ConfigProvider } from '../config/config';
import { KeyProvider } from '../key/key';
let BackupProvider = class BackupProvider {
    constructor(appProvider, bwcProvider, configProvider, downloadProvider, logger, profileProvider, keyProvider) {
        this.appProvider = appProvider;
        this.bwcProvider = bwcProvider;
        this.configProvider = configProvider;
        this.downloadProvider = downloadProvider;
        this.logger = logger;
        this.profileProvider = profileProvider;
        this.keyProvider = keyProvider;
        this.logger.debug('BackupProvider initialized');
    }
    walletDownload(walletId, opts, password) {
        return new Promise((resolve, reject) => {
            let config = this.configProvider.get();
            let wallet = this.profileProvider.getWallet(walletId);
            let ew = this.walletExport(walletId, opts, password);
            if (!ew)
                return reject('Could not create backup');
            let walletName = wallet.credentials.walletName || wallet.credentials.walletId;
            let alias = config.aliasFor && config.aliasFor[wallet.credentials.walletId];
            if (alias) {
                walletName = alias + ' [' + walletName + ']';
            }
            if (opts.noSign)
                walletName = walletName + '-noSign';
            let filename = walletName + '-' + this.appProvider.info.nameCase + 'backup.aes.json';
            this.downloadProvider.download(ew, filename).then(() => {
                return resolve();
            });
        });
    }
    walletExport(walletId, opts, password) {
        if (!password) {
            return null;
        }
        let wallet = this.profileProvider.getWallet(walletId);
        try {
            opts = opts ? opts : {};
            let b = {};
            b.credentials = JSON.parse(wallet.toString(opts));
            if (b.credentials.keyId && opts.noSign) {
                delete b.credentials.keyId;
            }
            if (wallet.canSign && !opts.noSign) {
                const k = {};
                Object.assign(k, this.keyProvider.getKey(wallet.credentials.keyId));
                if (opts.password) {
                    const k1 = this.keyProvider.get(wallet.credentials.keyId, opts.password);
                    k.mnemonic = k1.mnemonic;
                    k.xPrivKey = k1.xPrivKey;
                    delete k.xPrivKeyEncrypted;
                    delete k.mnemonicEncrypted;
                }
                b.key = k;
            }
            if (opts.addressBook)
                b.addressBook = opts.addressBook;
            b = JSON.stringify(b);
            return this.bwcProvider.getSJCL().encrypt(password, b, {
                iter: 10000
            });
        }
        catch (err) {
            this.logger.error('Error exporting wallet: ', err);
            return null;
        }
    }
};
BackupProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AppProvider,
        BwcProvider,
        ConfigProvider,
        DownloadProvider,
        Logger,
        ProfileProvider,
        KeyProvider])
], BackupProvider);
export { BackupProvider };
//# sourceMappingURL=backup.js.map