import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import * as _ from 'lodash';
// pages
import { AddFundsPage } from '../../onboarding/add-funds/add-funds';
import { DisclaimerPage } from '../../onboarding/disclaimer/disclaimer';
// providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { BwcProvider } from '../../../providers/bwc/bwc';
import { KeyProvider } from '../../../providers/key/key';
import { Logger } from '../../../providers/logger/logger';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
import { ProfileProvider } from '../../../providers/profile/profile';
let BackupGamePage = class BackupGamePage {
    constructor(navCtrl, navParams, logger, profileProvider, bwcProvider, actionSheetProvider, keyProvider, persistenceProvider) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.logger = logger;
        this.profileProvider = profileProvider;
        this.bwcProvider = bwcProvider;
        this.actionSheetProvider = actionSheetProvider;
        this.keyProvider = keyProvider;
        this.persistenceProvider = persistenceProvider;
        this.mnemonicWords = this.navParams.data.words;
        this.keys = this.navParams.data.keys;
        this.keyId = this.navParams.data.keyId;
        this.setFlow();
    }
    ionViewDidLoad() {
        if (this.gameSlides)
            this.gameSlides.lockSwipes(true);
        this.wideHeader.navBar.backButtonClick = () => {
            if (this.customWords.length > 0) {
                this.clear();
            }
            else {
                this.navCtrl.pop();
            }
        };
    }
    shuffledWords(words) {
        const sort = _.sortBy(words);
        return _.map(sort, w => {
            return {
                word: w,
                selected: false
            };
        });
    }
    addButton(index, item) {
        const newWord = {
            word: item.word,
            prevIndex: index
        };
        this.customWords.push(newWord);
        this.shuffledMnemonicWords[index].selected = true;
        this.shouldContinue();
        setTimeout(() => {
            this.gameSlides.lockSwipes(false);
            this.gameSlides.slideNext();
            this.gameSlides.lockSwipes(true);
        }, 300);
    }
    removeButton(index, item) {
        this.customWords.splice(index, 1);
        this.shuffledMnemonicWords[item.prevIndex].selected = false;
        this.shouldContinue();
        setTimeout(() => {
            this.gameSlides.lockSwipes(false);
            this.gameSlides.slidePrev();
            this.gameSlides.lockSwipes(true);
        }, 300);
    }
    shouldContinue() {
        this.selectComplete =
            this.customWords.length === this.shuffledMnemonicWords.length
                ? true
                : false;
    }
    clear() {
        this.customWords = [];
        this.shuffledMnemonicWords.forEach(word => {
            word.selected = false;
        });
        this.selectComplete = false;
        setTimeout(() => {
            this.gameSlides.lockSwipes(false);
            this.gameSlides.slideTo(0);
            this.gameSlides.lockSwipes(true);
        }, 300);
    }
    setFlow() {
        if (!this.mnemonicWords)
            return;
        this.shuffledMnemonicWords = this.shuffledWords(this.mnemonicWords);
        this.mnemonicHasPassphrase = this.keyProvider.mnemonicHasPassphrase(this.keyId);
        this.useIdeograms = this.mnemonicWords.indexOf('\u3000') >= 0;
        this.password = '';
        this.customWords = [];
        this.selectComplete = false;
    }
    finalStep() {
        const customWordList = _.map(this.customWords, 'word');
        if (!_.isEqual(this.mnemonicWords, customWordList)) {
            this.showErrorInfoSheet('Mnemonic string mismatch');
            return;
        }
        if (this.mnemonicHasPassphrase) {
            const keyClient = this.bwcProvider.getKey();
            const separator = this.useIdeograms ? '\u3000' : ' ';
            const customSentence = customWordList.join(separator);
            const password = this.password || '';
            let key;
            try {
                key = new keyClient({
                    seedType: 'mnemonic',
                    seedData: customSentence,
                    useLegacyCoinType: false,
                    useLegacyPurpose: false,
                    passphrase: password
                });
            }
            catch (err) {
                this.showErrorInfoSheet(err);
                return;
            }
            if (key.get().xPrivKey != this.keys.xPrivKey) {
                this.showErrorInfoSheet('Private key mismatch');
                return;
            }
        }
        this.profileProvider.setBackupGroupFlag(this.keyId);
        const opts = {
            keyId: this.keyId,
            showHidden: true
        };
        const wallets = this.profileProvider.getWalletsFromGroup(opts);
        wallets.forEach(w => {
            this.profileProvider.setWalletBackup(w.credentials.walletId);
        });
        this.showSuccessInfoSheet();
    }
    showSuccessInfoSheet() {
        const infoSheet = this.actionSheetProvider.createInfoSheet('correct-recovery-prhase');
        infoSheet.present();
        infoSheet.onDidDismiss(() => {
            if (this.navParams.data.isOnboardingFlow) {
                this.persistenceProvider
                    .getCopayDisclaimerFlag()
                    .then(disclaimerAgreed => {
                    disclaimerAgreed
                        ? this.navCtrl.push(AddFundsPage, { keyId: this.keyId })
                        : this.navCtrl.push(DisclaimerPage, { keyId: this.keyId });
                });
            }
            else
                this.navCtrl.popToRoot();
        });
    }
    showErrorInfoSheet(err) {
        this.logger.warn('Failed to verify backup: ', err);
        const infoSheet = this.actionSheetProvider.createInfoSheet('incorrect-recovery-prhase');
        infoSheet.present();
        infoSheet.onDidDismiss(() => {
            this.clear();
            this.setFlow();
        });
    }
};
__decorate([
    ViewChild('gameSlides'),
    __metadata("design:type", Slides)
], BackupGamePage.prototype, "gameSlides", void 0);
__decorate([
    ViewChild('wideHeader'),
    __metadata("design:type", Object)
], BackupGamePage.prototype, "wideHeader", void 0);
BackupGamePage = __decorate([
    Component({
        selector: 'page-backup-game',
        templateUrl: 'backup-game.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Logger,
        ProfileProvider,
        BwcProvider,
        ActionSheetProvider,
        KeyProvider,
        PersistenceProvider])
], BackupGamePage);
export { BackupGamePage };
//# sourceMappingURL=backup-game.js.map