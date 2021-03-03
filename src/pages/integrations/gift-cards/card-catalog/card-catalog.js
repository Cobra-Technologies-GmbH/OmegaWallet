var CardCatalogPage_1;
import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import * as _ from 'lodash';
import { BuyCardPage } from '../buy-card/buy-card';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActionSheetProvider, ExternalLinkProvider, PlatformProvider, ThemeProvider } from '../../../../providers';
import { getPromo, GiftCardProvider, hasVisibleDiscount } from '../../../../providers/gift-card/gift-card';
import { getDiscount, getDiscountTextColor, MerchantProvider } from '../../../../providers/merchant/merchant';
import { MerchantPage } from '../../../merchant/merchant';
import { WideHeaderPage } from '../../../templates/wide-header-page/wide-header-page';
let CardCatalogPage = CardCatalogPage_1 = class CardCatalogPage extends WideHeaderPage {
    constructor(actionSheetProvider, externalLinkProvider, giftCardProvider, merchantProvider, platformProvider, navCtrl, navParams, themeProvider) {
        super(platformProvider);
        this.actionSheetProvider = actionSheetProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.giftCardProvider = giftCardProvider;
        this.merchantProvider = merchantProvider;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.themeProvider = themeProvider;
        this.giftCardsOnly = false;
        this.searchQuery = '';
        this.searchQuerySubject = new Subject();
        this.visibleMerchants = [];
        this.getDiscountTextColor = getDiscountTextColor;
        this.isCordova = false;
    }
    ngOnInit() {
        this.isCordova = this.platformProvider.isCordova;
        this.category = this.navParams.get('category');
        this.giftCardsOnly = this.navParams.get('giftCardsOnly');
        this.title = this.category
            ? this.category
            : this.giftCardsOnly
                ? 'Gift Cards'
                : 'Shop';
        this.searchQuerySubject.pipe(debounceTime(300)).subscribe(query => {
            this.searchQuery = query;
            this.updateCardList();
        });
        this.merchantProvider
            .getMerchants()
            .then((allMerchants) => __awaiter(this, void 0, void 0, function* () {
            const merchants = allMerchants.filter(merchant => this.giftCardsOnly ? merchant.giftCards.length : true);
            this.allMerchants = merchants;
            if (merchants.length < 10) {
                this.category = 'All';
            }
            this.categories = getUniqueCategoriesOrCurations(this.allMerchants, 'categories');
            this.curations = buildCurations(this.allMerchants);
            this.updateCardList();
        }))
            .catch(_ => {
            this.showError();
            return [];
        });
    }
    slideChanged(slides, index) {
        const activeSlideIndex = this.slides.toArray()[index].getActiveIndex();
        const visibleCards = slides[activeSlideIndex] || [];
        visibleCards
            .filter(merchant => merchant.giftCards.length)
            .map(merchant => merchant.giftCards[0])
            .filter(cardConfig => hasVisibleDiscount(cardConfig))
            .forEach(promotedCard => this.giftCardProvider.logEvent('presentedWithGiftCardPromo', this.giftCardProvider.getPromoEventParams(promotedCard, 'Shop Page Curation')));
    }
    getDiscount(merchant) {
        return getDiscount(merchant);
    }
    ionViewDidEnter() {
        this.logGiftCardCatalogHomeView();
    }
    onSearch(query) {
        this.searchQuerySubject.next(query);
    }
    viewCategory(category) {
        this.navCtrl.push(CardCatalogPage_1, {
            category,
            giftCardsOnly: this.giftCardsOnly
        });
    }
    trackBy(record) {
        return record.name;
    }
    updateCardList() {
        this.visibleMerchants = this.allMerchants
            .filter(merchant => isMerchantInSearchResults(merchant, this.searchQuery))
            .filter(merchant => !this.category ||
            this.category === 'All' ||
            [
                ...merchant.categories.map(category => category.displayName),
                ...merchant.curations.map(curation => curation.displayName)
            ].includes(this.category));
    }
    viewMerchant(merchant) {
        return merchant.hasDirectIntegration
            ? this.navCtrl.push(MerchantPage, { merchant })
            : this.buyCard(merchant.giftCards[0]);
    }
    buyCard(cardConfig) {
        this.logGiftCardBrandView(cardConfig);
        this.navCtrl.push(BuyCardPage, { cardConfig });
        if (!!getPromo(cardConfig)) {
            this.logPromoClick(cardConfig);
        }
    }
    logGiftCardCatalogHomeView() {
        this.giftCardProvider.logEvent('giftcards_view_home', {});
    }
    logGiftCardBrandView(cardConfig) {
        this.giftCardProvider.logEvent('giftcards_view_brand', {
            brand: cardConfig.name
        });
        this.giftCardProvider.logEvent('view_item', {
            items: [
                {
                    brand: cardConfig.name,
                    category: 'giftCards'
                }
            ]
        });
    }
    logPromoClick(cardConfig) {
        this.giftCardProvider.logEvent('clickedGiftCardPromo', this.giftCardProvider.getPromoEventParams(cardConfig, this.category ? 'Gift Card List' : 'Shop Page Curation'));
    }
    launchExtension() {
        this.externalLinkProvider.open('https://bitpay.com/extension/?launchExtension=true');
    }
    showError() {
        const errorInfoSheet = this.actionSheetProvider.createInfoSheet('gift-cards-unavailable');
        errorInfoSheet.present();
        errorInfoSheet.onDidDismiss(() => this.navCtrl.pop());
    }
};
__decorate([
    ViewChild(WideHeaderPage),
    __metadata("design:type", WideHeaderPage)
], CardCatalogPage.prototype, "wideHeaderPage", void 0);
__decorate([
    ViewChildren(Slides),
    __metadata("design:type", QueryList)
], CardCatalogPage.prototype, "slides", void 0);
CardCatalogPage = CardCatalogPage_1 = __decorate([
    Component({
        selector: 'card-catalog-page',
        templateUrl: 'card-catalog.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        ExternalLinkProvider,
        GiftCardProvider,
        MerchantProvider,
        PlatformProvider,
        NavController,
        NavParams,
        ThemeProvider])
], CardCatalogPage);
export { CardCatalogPage };
function buildCurations(merchants) {
    const uniqueCurations = getUniqueCategoriesOrCurations(merchants, 'curations');
    return uniqueCurations.map(curation => ({
        displayName: curation.displayName,
        slides: merchants
            .filter(merchant => merchant.curations
            .map(merchantCuration => merchantCuration.displayName)
            .includes(curation.displayName))
            .sort((a, b) => a.curations.find(c => c.displayName === curation.displayName)
            .merchantIndex -
            b.curations.find(c => c.displayName === curation.displayName)
                .merchantIndex)
            .reduce((all, one, i) => {
            const ch = Math.floor(i / 3);
            all[ch] = [].concat(all[ch] || [], one);
            return all;
        }, [])
    }));
}
export function isMerchantInSearchResults(m, search = '') {
    const merchantName = (m.displayName || m.name).toLowerCase();
    const query = search.toLowerCase();
    const matchableText = [
        merchantName,
        stripPunctuation(merchantName),
        ...m.tags
    ];
    return !search || matchableText.some(text => text.indexOf(query) > -1);
}
export function stripPunctuation(text) {
    return text.replace(/[^\w\s]|_/g, '');
}
function getUniqueCategoriesOrCurations(merchants, field) {
    return _.uniqBy(merchants
        .filter(merchant => merchant[field].length)
        .map(merchant => merchant[field])
        .reduce((allCurations, merchantCurations) => [
        ...allCurations,
        ...merchantCurations
    ], []), categoryOrCuration => categoryOrCuration.displayName).sort((a, b) => a.index - b.index);
}
//# sourceMappingURL=card-catalog.js.map