import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { timer } from 'rxjs/observable/timer';
import { isDark } from '../color/color';
import { DirectoryProvider } from '../directory/directory';
import { GiftCardProvider, sortByDisplayName } from '../gift-card/gift-card';
let MerchantProvider = class MerchantProvider {
    constructor(directoryProvider, events, giftCardProvider) {
        this.directoryProvider = directoryProvider;
        this.events = events;
        this.giftCardProvider = giftCardProvider;
        this.listenForAuthChanges();
    }
    listenForAuthChanges() {
        const authChangeEvents = [
            'BitPayId/Connected',
            'BitPayId/Disconnected',
            'BitPayId/SettingsChanged',
            'GiftCards/GiftCardPurchased'
        ];
        authChangeEvents.forEach(authChangeEvent => this.events.subscribe(authChangeEvent, () => this.refreshMerchants()));
    }
    refreshMerchants() {
        return __awaiter(this, void 0, void 0, function* () {
            yield timer(1200).toPromise();
            yield this.getMerchants(true);
        });
    }
    fetchMerchants() {
        this.merchantPromise = Promise.all([
            this.directoryProvider.fetchDirectIntegrations(),
            this.giftCardProvider.getAvailableCards(),
            this.directoryProvider.fetchDirectory(),
            this.giftCardProvider.getRecentlyPurchasedBrandNames()
        ]).then(([directIntegrations, availableGiftCardBrands, directory, recentlyPurchasedBrandNames]) => buildMerchants(directIntegrations, availableGiftCardBrands, directory, recentlyPurchasedBrandNames));
        return this.merchantPromise;
    }
    getMerchants(bustCache = false) {
        return this.merchantPromise && !bustCache
            ? this.merchantPromise
            : this.fetchMerchants();
    }
};
MerchantProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DirectoryProvider,
        Events,
        GiftCardProvider])
], MerchantProvider);
export { MerchantProvider };
export function buildMerchants(directIntegrations = [], availableGiftCardBrands = [], directory, recentlyPurchasedBrandNames) {
    const directIntegrationMerchants = directIntegrations.map(integration => (Object.assign(Object.assign({}, integration), { hasDirectIntegration: true, giftCards: [] })));
    const giftCardMerchants = availableGiftCardBrands.map(cardConfig => ({
        hasDirectIntegration: false,
        name: cardConfig.name,
        displayName: cardConfig.displayName,
        caption: cardConfig.description,
        featured: cardConfig.featured,
        icon: cardConfig.icon,
        link: cardConfig.website,
        displayLink: cardConfig.website,
        tags: cardConfig.tags || [],
        domains: [cardConfig.website].concat(cardConfig.supportedUrls || []),
        theme: cardConfig.brandColor || cardConfig.logoBackgroundColor,
        instructions: cardConfig.description,
        giftCards: [cardConfig]
    }));
    const allMerchants = [
        ...directIntegrationMerchants,
        ...giftCardMerchants
    ];
    const recentlyPurchasedAvailableBrandNames = recentlyPurchasedBrandNames.filter(brandName => allMerchants.some(merchant => merchant.displayName === brandName));
    const fullDirectory = appendFeaturedGiftCardsToPopularBrands(directory, availableGiftCardBrands);
    return allMerchants
        .map(merchant => appendCategories(merchant, fullDirectory, recentlyPurchasedAvailableBrandNames))
        .sort(sortByDisplayName);
}
export function appendFeaturedGiftCardsToPopularBrands(directory, availableGiftCards = []) {
    const popularBrands = directory.curated.find(curation => curation.name === 'popularBrands');
    const popularAndFeaturedBrands = Object.assign(Object.assign({}, popularBrands), { merchants: [
            ...new Set([
                ...popularBrands.merchants,
                ...availableGiftCards
                    .filter(cardConfig => cardConfig.featured)
                    .map(brand => brand.displayName)
            ])
        ].sort((a, b) => sortByDisplayName({ displayName: a }, { displayName: b })) });
    return Object.assign(Object.assign({}, directory), { curated: directory.curated.map(curation => curation.name === 'popularBrands' ? popularAndFeaturedBrands : curation) });
}
export function appendCategories(merchant, directory, recentlyPurchasedBrandNames) {
    const baseCurations = directory.curated
        .map((curation, index) => (Object.assign(Object.assign({}, curation), { index, merchantIndex: curation.merchants.indexOf(merchant.displayName) })))
        .filter(curation => curation.merchants.includes(merchant.displayName));
    const curations = recentlyPurchasedBrandNames.includes(merchant.displayName)
        ? [
            {
                displayName: 'Recently Purchased',
                index: -1,
                merchantIndex: recentlyPurchasedBrandNames.indexOf(merchant.displayName),
                merchants: recentlyPurchasedBrandNames,
                name: 'recentlyPurchased'
            },
            ...baseCurations
        ]
        : baseCurations;
    return Object.assign(Object.assign({}, merchant), { categories: directory.categories
            .map((category, index) => (Object.assign(Object.assign({}, category), { index })))
            .filter(category => category.tags.some(tag => merchant.tags.includes(tag))), curations });
}
export function getGiftCardDiscount(merchant) {
    const cardConfig = merchant.giftCards[0];
    return cardConfig && cardConfig.discounts && cardConfig.discounts[0];
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getDiscount(merchant) {
    return merchant.discount || getGiftCardDiscount(merchant);
}
export function getDiscountTextColor(merchant, appTheme = 'Light Mode') {
    return merchant.theme === '#ffffff' ||
        merchant.theme === '#000000' ||
        (appTheme === 'Dark Mode' && isDark(merchant.theme))
        ? '#4f6ef7'
        : merchant.theme;
}
//# sourceMappingURL=merchant.js.map