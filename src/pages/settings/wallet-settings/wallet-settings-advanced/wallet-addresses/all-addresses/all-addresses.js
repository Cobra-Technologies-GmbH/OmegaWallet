import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Logger } from '../../../../../../providers/logger/logger';
// native
import { SocialSharing } from '@ionic-native/social-sharing';
// providers
import { AppProvider } from '../../../../../../providers/app/app';
import { OnGoingProcessProvider } from '../../../../../../providers/on-going-process/on-going-process';
import { PlatformProvider } from '../../../../../../providers/platform/platform';
let AllAddressesPage = class AllAddressesPage {
    constructor(navParams, viewCtrl, onGoingProcessProvider, socialSharing, appProvider, logger, platformProvider) {
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.socialSharing = socialSharing;
        this.appProvider = appProvider;
        this.logger = logger;
        this.platformProvider = platformProvider;
        this.walletName = this.navParams.data.walletName;
        this.noBalance = this.navParams.data.noBalance;
        this.withBalance = this.navParams.data.withBalance;
        this.coin = this.navParams.data.coin;
        this.allAddresses = this.noBalance.concat(this.withBalance);
        this.isCordova = this.platformProvider.isCordova;
    }
    dismiss() {
        this.viewCtrl.dismiss();
    }
    formatDate(ts) {
        const dateObj = new Date(ts * 1000);
        if (!dateObj) {
            this.logger.warn('Error formating a date');
            return 'DateError';
        }
        if (!dateObj.toJSON()) {
            return '';
        }
        return dateObj.toJSON();
    }
    sendByEmail() {
        this.onGoingProcessProvider.set('sendingByEmail');
        setTimeout(() => {
            this.onGoingProcessProvider.clear();
            const appName = this.appProvider.info.nameCase;
            let body = appName +
                ' Wallet "' +
                this.walletName +
                '" Addresses\n  Only Main Addresses are  shown.\n\n';
            body += '\n';
            body += this.allAddresses
                .map(v => {
                return ('* ' +
                    v.address +
                    ' xpub' +
                    v.path.substring(1) +
                    ' ' +
                    this.formatDate(v.createdOn));
            })
                .join('\n');
            const subject = appName + ' Addresses';
            // Check if sharing via email is supported
            this.socialSharing
                .canShareViaEmail()
                .then(() => {
                this.logger.info('sharing via email is possible');
                this.socialSharing
                    .shareViaEmail(body, subject, null, // TO: must be null or an array
                null, // CC: must be null or an array
                null, // BCC: must be null or an array
                null // FILES: can be null, a string, or an array
                )
                    .then(data => {
                    this.logger.info('Email created successfully: ', data);
                })
                    .catch(err => {
                    this.logger.error('socialSharing Error: ', err);
                });
            })
                .catch(() => {
                this.logger.warn('sharing via email is not possible');
                this.socialSharing.share(body, subject).catch(err => {
                    this.logger.error('socialSharing Error: ', err);
                });
            });
        });
    }
};
AllAddressesPage = __decorate([
    Component({
        selector: 'page-all-addresses',
        templateUrl: 'all-addresses.html'
    }),
    __metadata("design:paramtypes", [NavParams,
        ViewController,
        OnGoingProcessProvider,
        SocialSharing,
        AppProvider,
        Logger,
        PlatformProvider])
], AllAddressesPage);
export { AllAddressesPage };
//# sourceMappingURL=all-addresses.js.map