import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ActionSheetProvider } from '../../../../providers';
import { GiftCardProvider } from '../../../../providers/gift-card/gift-card';
import { Logger } from '../../../../providers/logger/logger';
import { BuyCardPage } from '../buy-card/buy-card';
import { CardDetailsPage } from '../card-details/card-details';
import { CardListItemComponent } from './card-list-item/card-list-item';
let PurchasedCardsPage = class PurchasedCardsPage {
    constructor(actionSheetProvider, giftCardProvider, logger, navCtrl, navParams) {
        this.actionSheetProvider = actionSheetProvider;
        this.giftCardProvider = giftCardProvider;
        this.logger = logger;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            const cardName = this.navParams.get('cardName');
            this.cardConfig = yield this.giftCardProvider.getCardConfig(cardName);
            yield this.getCards();
            this.listenForUpdates();
        });
    }
    ionViewDidLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Loaded: PurchasedCardsPage');
        });
    }
    listenForUpdates() {
        this.giftCardProvider.cardUpdates$.subscribe(card => this.updateCard(card));
    }
    updateCard(card) {
        this.allGiftCards = this.allGiftCards.map(oldCard => oldCard.invoiceId === card.invoiceId ? card : oldCard);
        this.setGiftCards(this.allGiftCards);
    }
    addCard() {
        return __awaiter(this, void 0, void 0, function* () {
            this.navCtrl.push(BuyCardPage, { cardConfig: this.cardConfig });
        });
    }
    archive() {
        return __awaiter(this, void 0, void 0, function* () {
            const archiveSheet = this.actionSheetProvider.createInfoSheet('archive-all-gift-cards', { brand: this.cardConfig.displayName });
            archiveSheet.present();
            archiveSheet.onDidDismiss((confirm) => __awaiter(this, void 0, void 0, function* () {
                if (!confirm)
                    return;
                yield this.navCtrl.pop();
                this.giftCardProvider.archiveAllCards(this.cardConfig.name);
            }));
        });
    }
    getCards() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.giftCardProvider
                .getPurchasedCards(this.cardConfig.name)
                .then(cards => this.setGiftCards(cards))
                .catch(err => this.logger.error(err));
            this.giftCardProvider.updatePendingGiftCards(this.currentGiftCards);
        });
    }
    setGiftCards(allCards) {
        this.allGiftCards = allCards;
        this.currentGiftCards = allCards.filter(gc => !gc.archived);
        this.archivedGiftCards = allCards.filter(gc => gc.archived);
    }
    goToCardDetails(card) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.navCtrl.push(CardDetailsPage, { card });
            this.currentGiftCards.length === 1 && this.removePageFromHistory();
        });
    }
    removePageFromHistory() {
        const startIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(startIndex, 1);
    }
};
PurchasedCardsPage = __decorate([
    Component({
        selector: 'purchased-cards-page',
        templateUrl: 'purchased-cards.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        GiftCardProvider,
        Logger,
        NavController,
        NavParams])
], PurchasedCardsPage);
export { PurchasedCardsPage };
export const PURCHASED_CARDS_PAGE_COMPONENTS = [
    PurchasedCardsPage,
    CardListItemComponent
];
//# sourceMappingURL=purchased-cards.js.map