import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
// pages
import { CreateWalletPage } from '../add/create-wallet/create-wallet';
import { JoinWalletPage } from '../add/join-wallet/join-wallet';
import { SelectCurrencyPage } from '../add/select-currency/select-currency';
// providers
import { Logger } from '../../providers/logger/logger';
import { ProfileProvider } from '../../providers/profile/profile';
import * as _ from 'lodash';
let AddWalletPage = class AddWalletPage {
    constructor(navCtrl, logger, profileProvider, navParams, translate) {
        this.navCtrl = navCtrl;
        this.logger = logger;
        this.profileProvider = profileProvider;
        this.navParams = navParams;
        this.translate = translate;
        this.fromEthCard = this.navParams.data.fromEthCard;
        this.title = this.fromEthCard
            ? this.translate.instant('Select Key to add ETH Wallet to')
            : this.translate.instant('Select Key');
        const opts = {
            canAddNewAccount: true,
            showHidden: true
        };
        const wallets = this.profileProvider.getWallets(opts);
        this.walletsGroups = _.values(_.groupBy(wallets, 'keyId'));
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: AddWalletPage');
    }
    goToAddPage(keyId) {
        if (this.navParams.data.isCreate) {
            if (this.fromEthCard) {
                this.navCtrl.push(CreateWalletPage, {
                    isShared: false,
                    coin: 'eth',
                    keyId
                });
            }
            else {
                this.navCtrl.push(SelectCurrencyPage, {
                    isShared: this.navParams.data.isShared,
                    isZeroState: keyId ? false : true,
                    keyId
                });
            }
        }
        else if (this.navParams.data.isJoin) {
            this.navCtrl.push(JoinWalletPage, {
                keyId,
                url: this.navParams.data.url
            });
        }
    }
};
AddWalletPage = __decorate([
    Component({
        selector: 'page-add-wallet',
        templateUrl: 'add-wallet.html'
    }),
    __metadata("design:paramtypes", [NavController,
        Logger,
        ProfileProvider,
        NavParams,
        TranslateService])
], AddWalletPage);
export { AddWalletPage };
//# sourceMappingURL=add-wallet.js.map