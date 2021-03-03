import { __awaiter, __decorate, __metadata } from "tslib";
import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component, Input, ViewChild } from '@angular/core';
import { Content, ItemSliding, NavController } from 'ionic-angular';
import { timer } from 'rxjs/observable/timer';
import { debounceTime } from 'rxjs/operators';
import { ActionSheetProvider, AppProvider, ExternalLinkProvider, PersistenceProvider, PlatformProvider } from '../../../../providers';
import { GiftCardProvider, sortByDisplayName } from '../../../../providers/gift-card/gift-card';
import { BuyCardPage } from '../buy-card/buy-card';
import { CardCatalogPage } from '../card-catalog/card-catalog';
import { CardDetailsPage } from '../card-details/card-details';
import { PurchasedCardsPage } from '../purchased-cards/purchased-cards';
import { GiftCardItem } from './gift-card-item/gift-card-item';
let HomeGiftCards = class HomeGiftCards {
    constructor(actionSheetProvider, appProvider, externalLinkProvider, giftCardProvider, navCtrl, persistenceProvider, platformProvider) {
        this.actionSheetProvider = actionSheetProvider;
        this.appProvider = appProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.giftCardProvider = giftCardProvider;
        this.navCtrl = navCtrl;
        this.persistenceProvider = persistenceProvider;
        this.platformProvider = platformProvider;
        this.hideDiscount = false;
        this.primaryCatalogCurrency = 'usd';
        this.disableArchiveAnimation = true; // Removes flicker on iOS when returning to home tab
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.appName = this.appProvider.info.userVisibleName;
            yield this.initGiftCards();
            setTimeout(() => {
                this.ready = true;
            }, 50);
            const availableCards = yield this.giftCardProvider.getAvailableCards();
            this.primaryCatalogCurrency = getPrimaryCatalogCurrency(availableCards);
            this.hideDiscount = yield this.persistenceProvider.getHideGiftCardDiscountItem();
            yield timer(3000).toPromise();
            this.giftCardProvider.preloadImages();
        });
    }
    buyGiftCards() {
        this.navCtrl.push(CardCatalogPage, { giftCardsOnly: true });
    }
    buyCard(cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            const cardConfig = yield this.giftCardProvider.getCardConfig(cardName);
            this.navCtrl.push(BuyCardPage, { cardConfig });
        });
    }
    onGiftCardAction(event, purchasedCards) {
        event.action === 'view'
            ? this.viewGiftCards(event.cardName, purchasedCards)
            : this.showArchiveSheet(event);
    }
    launchExtension() {
        this.externalLinkProvider.open('https://bitpay.com/extension/?launchExtension=true');
    }
    viewGiftCards(cardName, cards) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeCards = cards.filter(c => !c.archived);
            activeCards.length === 1
                ? this.navCtrl.push(CardDetailsPage, { card: activeCards[0] })
                : this.navCtrl.push(PurchasedCardsPage, { cardName });
        });
    }
    showArchiveSheet(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const brandCards = this.activeBrands
                .find(brandCards => brandCards[0].name === event.cardName)
                .filter(card => !card.archived);
            const sheetName = brandCards.length === 1 ? 'archive-gift-card' : 'archive-all-gift-cards';
            const cardConfig = yield this.giftCardProvider.getCardConfig(brandCards[0].name);
            const archiveSheet = this.actionSheetProvider.createInfoSheet(sheetName, {
                brand: cardConfig.displayName
            });
            archiveSheet.present();
            archiveSheet.onDidDismiss((confirm) => __awaiter(this, void 0, void 0, function* () {
                if (!confirm)
                    return;
                yield this.giftCardProvider.archiveAllCards(event.cardName);
            }));
        });
    }
    showHideDiscountItemSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            this.slidingItem.close();
            const hideDiscountSheet = this.actionSheetProvider.createInfoSheet('hide-gift-card-discount-item');
            hideDiscountSheet.present();
            hideDiscountSheet.onDidDismiss((confirm) => __awaiter(this, void 0, void 0, function* () {
                if (!confirm)
                    return;
                this.disableArchiveAnimation = false;
                this.hideDiscount = true;
                yield this.giftCardProvider.hideDiscountItem();
            }));
        });
    }
    hideArchivedBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableArchiveAnimation = false;
            const purchasedBrands = yield this.giftCardProvider.getPurchasedBrands();
            const { activeCardNames } = yield this.getActiveGiftCards(purchasedBrands);
            const filteredBrands = this.activeBrands.filter(cards => activeCardNames.indexOf(cards[0].name) > -1);
            filteredBrands.length === this.activeBrands.length
                ? this.loadGiftCards()
                : (this.activeBrands = filteredBrands);
        });
    }
    initGiftCards() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadGiftCards(true);
            this.giftCardProvider.cardUpdates$
                .pipe(debounceTime(300))
                .subscribe(card => card.archived ? this.hideArchivedBrands() : this.loadGiftCards());
        });
    }
    getActiveGiftCards(purchasedBrands) {
        const activeCards = purchasedBrands.filter(cards => cards.filter(c => !c.archived).length);
        const activeCardNames = activeCards.map(cards => cards[0].name);
        return { activeCards, activeCardNames };
    }
    updatePendingGiftCards(purchasedBrands) {
        const allCards = purchasedBrands.reduce((allCards, brandCards) => [...allCards, ...brandCards], []);
        this.giftCardProvider.updatePendingGiftCards(allCards);
    }
    loadGiftCards(isInitialLoad = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableArchiveAnimation = true;
            const activeCards = isInitialLoad
                ? this.activeCards
                : yield this.giftCardProvider.getActiveCards();
            const activeBrands = this.groupCardsByBrand(activeCards);
            this.updatePendingGiftCards(activeBrands);
            this.activeBrands = activeBrands;
        });
    }
    groupCardsByBrand(cards) {
        return cards
            .reduce((brands, c) => {
            const brandCards = brands.find(b => b[0].name === c.name);
            brandCards ? brandCards.push(c) : brands.push([c]);
            return brands;
        }, [])
            .sort((a, b) => sortByDisplayName(a[0], b[0]));
    }
};
__decorate([
    Input(),
    __metadata("design:type", Array)
], HomeGiftCards.prototype, "activeCards", void 0);
__decorate([
    Input('scrollArea'),
    __metadata("design:type", Content)
], HomeGiftCards.prototype, "scrollArea", void 0);
__decorate([
    ViewChild(ItemSliding),
    __metadata("design:type", ItemSliding)
], HomeGiftCards.prototype, "slidingItem", void 0);
HomeGiftCards = __decorate([
    Component({
        selector: 'gift-cards',
        templateUrl: 'home-gift-cards.html',
        animations: [
            trigger('archiveAnimation', [
                transition(':leave', [
                    style({
                        opacity: 1
                    }),
                    animate('400ms 0ms ease', style({
                        opacity: 0,
                        marginTop: '-88px',
                        transform: 'translate3d(0, 88px, 0)'
                    }))
                ])
            ]),
            trigger('preventInitialChildAnimations', [
                transition(':enter', [query(':enter', [], { optional: true })])
            ]),
            trigger('fade', [
                transition(':enter', [
                    style({
                        transform: 'translateY(5px)',
                        opacity: 0
                    }),
                    animate('200ms')
                ])
            ])
        ]
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        AppProvider,
        ExternalLinkProvider,
        GiftCardProvider,
        NavController,
        PersistenceProvider,
        PlatformProvider])
], HomeGiftCards);
export { HomeGiftCards };
export function getPrimaryCatalogCurrency(availableCards) {
    const homeLogoCollageSupportedCurrencies = ['cad', 'eur', 'gbp', 'usd'];
    const firstBrandCurrency = availableCards[0] && availableCards[0].currency.toLowerCase();
    return homeLogoCollageSupportedCurrencies.indexOf(firstBrandCurrency) > -1
        ? firstBrandCurrency
        : 'usd';
}
export const HOME_GIFT_CARD_COMPONENTS = [HomeGiftCards, GiftCardItem];
//# sourceMappingURL=home-gift-cards.js.map