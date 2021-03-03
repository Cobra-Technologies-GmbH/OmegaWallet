import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
// providers
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { LanguageProvider } from '../../../providers/language/language';
import { ProfileProvider } from '../../../providers/profile/profile';
import { WalletProvider } from '../../../providers/wallet/wallet';
let LanguagePage = class LanguagePage {
    constructor(navCtrl, languageProvider, externalLinkProvider, profileProvider, walletProvider, translate) {
        this.navCtrl = navCtrl;
        this.languageProvider = languageProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.profileProvider = profileProvider;
        this.walletProvider = walletProvider;
        this.translate = translate;
        this.currentLanguage = this.languageProvider.getCurrent();
        this.languages = this.languageProvider.getAvailables();
    }
    openExternalLink() {
        let url = 'https://crowdin.com/project/copay';
        let optIn = true;
        let title = this.translate.instant('Open Translation Community');
        let message = this.translate.instant('You can make contributions by signing up on our Crowdin community translation website. We’re looking forward to hearing from you!');
        let okText = this.translate.instant('Open Crowdin');
        let cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    save(newLang) {
        this.languageProvider.set(newLang);
        this.navCtrl.pop();
        setTimeout(() => {
            const opts = {
                showHidden: true
            };
            let wallets = this.profileProvider.getWallets(opts);
            this.walletProvider.updateRemotePreferences(wallets);
        }, 1000);
    }
};
LanguagePage = __decorate([
    Component({
        selector: 'page-language',
        templateUrl: 'language.html'
    }),
    __metadata("design:paramtypes", [NavController,
        LanguageProvider,
        ExternalLinkProvider,
        ProfileProvider,
        WalletProvider,
        TranslateService])
], LanguagePage);
export { LanguagePage };
//# sourceMappingURL=language.js.map