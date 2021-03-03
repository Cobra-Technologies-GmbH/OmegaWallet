import { __awaiter, __decorate, __metadata, __rest } from "tslib";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { ImageLoader } from 'ionic-image-loader';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { from } from 'rxjs/observable/from';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';
import { switchMap } from 'rxjs/operators';
import { promiseSerial } from '../../utils';
import { AnalyticsProvider } from '../analytics/analytics';
import { AppProvider } from '../app/app';
import { BitPayIdProvider } from '../bitpay-id/bitpay-id';
import { ConfigProvider } from '../config/config';
import { EmailNotificationsProvider } from '../email-notifications/email-notifications';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { InvoiceProvider } from '../invoice/invoice';
import { Logger } from '../logger/logger';
import { Network, PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';
import { TimeProvider } from '../time/time';
let GiftCardProvider = class GiftCardProvider extends InvoiceProvider {
    constructor(analyticsProvider, appProvider, bitpayIdProvider, configProvider, events, imageLoader, homeIntegrationsProvider, timeProvider, emailNotificationsProvider, http, logger, persistenceProvider, platformProvider) {
        super(emailNotificationsProvider, http, logger, persistenceProvider);
        this.analyticsProvider = analyticsProvider;
        this.appProvider = appProvider;
        this.bitpayIdProvider = bitpayIdProvider;
        this.configProvider = configProvider;
        this.events = events;
        this.imageLoader = imageLoader;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.timeProvider = timeProvider;
        this.emailNotificationsProvider = emailNotificationsProvider;
        this.http = http;
        this.logger = logger;
        this.persistenceProvider = persistenceProvider;
        this.platformProvider = platformProvider;
        this.cardUpdatesSubject = new Subject();
        this.cardUpdates$ = this.cardUpdatesSubject.asObservable();
        this.fallbackIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAyCAQAAAA38nkBAAAADklEQVR42mP8/4Vx8CEAn9BhqacD+5kAAAAASUVORK5CYII=';
        this.logger.debug('GiftCardProvider initialized');
        this.listenForAuthChanges();
    }
    listenForAuthChanges() {
        this.events.subscribe('BitPayId/Connected', () => __awaiter(this, void 0, void 0, function* () {
            yield this.persistenceProvider.setBitPayIdSettings(this.getNetwork(), {
                syncGiftCardPurchases: true
            });
            yield timer(1000).toPromise();
            yield this.getSupportedCardConfigMap(true);
        }));
        this.events.subscribe('BitPayId/Disconnected', () => __awaiter(this, void 0, void 0, function* () {
            yield this.getSupportedCardConfigMap(true);
        }));
        this.events.subscribe('BitPayId/SettingsChanged', () => __awaiter(this, void 0, void 0, function* () {
            yield this.getSupportedCardConfigMap(true);
        }));
    }
    getCardConfig(cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            const cardConfigMap = yield this.getSupportedCardConfigMap();
            return cardConfigMap[cardName];
        });
    }
    getSupportedCardConfigMap(bustCache = false) {
        if (bustCache) {
            this.clearCardConfigCache();
        }
        return this.supportedCardMapPromise
            ? this.supportedCardMapPromise
            : this.fetchCardConfigMap();
    }
    clearCardConfigCache() {
        this.supportedCardMapPromise = undefined;
        this.availableCardsPromise = undefined;
    }
    fetchCardConfigMap() {
        return __awaiter(this, void 0, void 0, function* () {
            this.supportedCardMapPromise = this.getSupportedCards().then(availableCards => availableCards.reduce((map, cardConfig) => (Object.assign(Object.assign({}, map), { [cardConfig.name]: cardConfig })), {}));
            return this.supportedCardMapPromise;
        });
    }
    getCardMap(cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            const network = this.getNetwork();
            const map = yield this.persistenceProvider.getGiftCards(cardName, network);
            return map || {};
        });
    }
    shouldSyncGiftCardPurchasesWithBitPayId() {
        return __awaiter(this, void 0, void 0, function* () {
            const [user, userSettings] = yield Promise.all([
                this.persistenceProvider.getBitPayIdUserInfo(this.getNetwork()),
                this.persistenceProvider.getBitPayIdSettings(this.getNetwork())
            ]);
            return user && userSettings && userSettings.syncGiftCardPurchases;
        });
    }
    getUserEmail() {
        const getBitPayIdInfo = this.persistenceProvider.getBitPayIdUserInfo(this.getNetwork());
        const getGiftCardUserInfo = this.persistenceProvider.getGiftCardUserInfo();
        const shouldSync = this.shouldSyncGiftCardPurchasesWithBitPayId();
        return Promise.all([shouldSync, getBitPayIdInfo, getGiftCardUserInfo])
            .then(([shouldSync, ...rest]) => {
            const [bitpayIdEmail, giftCardEmail] = rest
                .map(result => (_.isString(result) ? JSON.parse(result) : result))
                .map(jsonResult => jsonResult && jsonResult.email);
            return ((shouldSync && bitpayIdEmail) ||
                giftCardEmail ||
                this.emailNotificationsProvider.getEmailIfEnabled());
        })
            .catch(_ => { });
    }
    createBitpayInvoice(data, attempt = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('BitPay Creating Invoice: try... ' + attempt);
            const params = {
                brand: data.cardName,
                currency: data.currency,
                amount: data.amount,
                clientId: data.uuid,
                discounts: data.discounts,
                email: data.email,
                phone: data.phone
            };
            const shouldSync = yield this.shouldSyncGiftCardPurchasesWithBitPayId();
            const promise = shouldSync
                ? this.createAuthenticatedBitpayInvoice.bind(this)
                : this.createUnauthenticatedBitpayInvoice.bind(this);
            const cardOrder = yield promise(params).catch((err) => __awaiter(this, void 0, void 0, function* () {
                this.logger.error('BitPay Create Invoice: ERROR', JSON.stringify(err));
                if (attempt <= 5 && err.status == 403) {
                    yield new Promise(resolve => setTimeout(resolve, 3000 * attempt));
                    return this.createBitpayInvoice(data, ++attempt);
                }
                else
                    throw err;
            }));
            this.logger.info('BitPay Create Invoice: SUCCESS');
            return cardOrder;
        });
    }
    createUnauthenticatedBitpayInvoice(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.getApiPath()}/pay`;
            const headers = new HttpHeaders({
                'Content-Type': 'application/json'
            });
            return this.http.post(url, params, { headers }).toPromise();
        });
    }
    createAuthenticatedBitpayInvoice(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.persistenceProvider.getBitPayIdUserInfo(this.getNetwork());
            return this.bitpayIdProvider.apiCall('createGiftCardInvoice', Object.assign(Object.assign({}, params), { email: user.email }));
        });
    }
    getActiveCards() {
        return __awaiter(this, void 0, void 0, function* () {
            const [configMap, giftCardMap] = yield Promise.all([
                this.getSupportedCardConfigMap(),
                this.persistenceProvider.getActiveGiftCards(this.getNetwork())
            ]);
            const validSchema = giftCardMap && Object.keys(giftCardMap).every(key => key !== 'undefined');
            return !giftCardMap || !validSchema
                ? this.migrateAndFetchActiveCards()
                : getCardsFromInvoiceMap(giftCardMap, configMap);
        });
    }
    getPurchasedCards(cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            const [configMap, giftCardMap] = yield Promise.all([
                this.getSupportedCardConfigMap(),
                this.getCardMap(cardName)
            ]);
            return getCardsFromInvoiceMap(giftCardMap, configMap);
        });
    }
    hideDiscountItem() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.persistenceProvider.setHideGiftCardDiscountItem(true);
        });
    }
    getAllCardsOfBrand(cardBrand) {
        return __awaiter(this, void 0, void 0, function* () {
            const supportedCards = yield this.getSupportedCards();
            const cardConfigs = supportedCards.filter(cardConfig => cardConfig.displayName === cardBrand);
            const cardPromises = cardConfigs.map(cardConfig => this.getPurchasedCards(cardConfig.name));
            const cardsGroup = yield Promise.all(cardPromises);
            return cardsGroup
                .reduce((allCards, brandCards) => allCards.concat(brandCards), [])
                .sort(sortByDescendingDate);
        });
    }
    getRecentlyPurchasedBrandNames() {
        return __awaiter(this, void 0, void 0, function* () {
            const purchasedBrands = yield Promise.race([
                this.getPurchasedBrands(),
                Observable.timer(3000)
                    .toPromise()
                    .then(() => {
                    this.logger.debug('Purchased brands took longer than 3s to load');
                    return [];
                })
            ]);
            this.logger.debug('got purchased brands');
            const recentlyPurchasedBrands = purchasedBrands
                .map(cards => cards.sort(sortByDescendingDate))
                .sort((a, b) => sortByDescendingDate(a[0], b[0]));
            return recentlyPurchasedBrands
                .map(brandCards => brandCards[0].displayName)
                .slice(0, 6);
        });
    }
    getPurchasedBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            const supportedCards = yield this.getSupportedCards();
            this.logger.debug('got supportedCards in getPurchasedBrands');
            const supportedCardNames = supportedCards.map(c => c.name);
            const purchasedCardPromises = supportedCardNames.map(cardName => this.getPurchasedCards(cardName));
            const purchasedCards = yield Promise.all(purchasedCardPromises);
            this.logger.debug('got purchasedCards in getPurchasedBrands');
            return purchasedCards
                .filter(brand => brand.length)
                .sort((a, b) => sortByDisplayName(a[0], b[0]));
        });
    }
    saveCard(giftCard, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldGiftCards = yield this.getCardMap(giftCard.name);
            const newMap = this.getNewSaveableGiftCardMap(oldGiftCards, giftCard, opts);
            const savePromise = this.persistCards(giftCard.name, newMap);
            yield Promise.all([savePromise, this.updateActiveCards([giftCard], opts)]);
        });
    }
    updateActiveCards(giftCardsToUpdate, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let oldActiveGiftCards = (yield this.persistenceProvider.getActiveGiftCards(this.getNetwork())) ||
                {};
            if (typeof oldActiveGiftCards !== 'object') {
                oldActiveGiftCards = {};
            }
            const newMap = giftCardsToUpdate.reduce((updatedMap, c) => this.getNewSaveableGiftCardMap(updatedMap, c, {
                remove: c.archived || opts.remove
            }), oldActiveGiftCards);
            return this.persistenceProvider.setActiveGiftCards(this.getNetwork(), JSON.stringify(newMap));
        });
    }
    clearActiveGiftCards() {
        return this.persistenceProvider.setActiveGiftCards(this.getNetwork(), JSON.stringify({}));
    }
    persistCards(cardName, newMap) {
        return this.persistenceProvider.setGiftCards(cardName, this.getNetwork(), JSON.stringify(newMap));
    }
    saveGiftCard(giftCard, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalCard = (yield this.getPurchasedCards(giftCard.name)).find(c => c.invoiceId === giftCard.invoiceId);
            const cardChanged = !originalCard ||
                originalCard.status !== giftCard.status ||
                originalCard.archived !== giftCard.archived ||
                originalCard.barcodeImage !== giftCard.barcodeImage;
            const shouldNotify = cardChanged && giftCard.status !== 'UNREDEEMED';
            yield this.saveCard(giftCard, opts);
            shouldNotify && this.cardUpdatesSubject.next(giftCard);
        });
    }
    getNewSaveableGiftCardMap(oldGiftCards, gc, opts) {
        if (_.isString(oldGiftCards)) {
            oldGiftCards = JSON.parse(oldGiftCards);
        }
        if (_.isString(gc)) {
            gc = JSON.parse(gc);
        }
        const isValidMap = gcMap => Object.keys(gcMap || {}).every(invoiceId => invoiceId.length > 15 && oldGiftCards[invoiceId].currency);
        let newMap = isValidMap(oldGiftCards) ? oldGiftCards : {};
        newMap[gc.invoiceId] = gc;
        if (opts && (opts.error || opts.status)) {
            newMap[gc.invoiceId] = _.assign(newMap[gc.invoiceId], opts);
        }
        if (opts && opts.remove) {
            delete newMap[gc.invoiceId];
        }
        return newMap;
    }
    archiveCard(card) {
        return __awaiter(this, void 0, void 0, function* () {
            card.archived = true;
            yield this.saveGiftCard(card);
        });
    }
    unarchiveCard(card) {
        return __awaiter(this, void 0, void 0, function* () {
            card.archived = false;
            yield this.saveGiftCard(card);
        });
    }
    archiveAllCards(cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeCards = (yield this.getPurchasedCards(cardName)).filter(c => !c.archived);
            const oldGiftCards = yield this.getCardMap(cardName);
            const invoiceIds = Object.keys(oldGiftCards);
            const newMap = invoiceIds.reduce((newMap, invoiceId) => {
                const card = oldGiftCards[invoiceId];
                card.archived = true;
                return this.getNewSaveableGiftCardMap(newMap, card);
            }, oldGiftCards);
            yield Promise.all([
                this.persistCards(cardName, newMap),
                this.updateActiveCards(activeCards.map(c => (Object.assign(Object.assign({}, c), { archived: true }))))
            ]);
            activeCards
                .map(c => (Object.assign(Object.assign({}, c), { archived: true })))
                .forEach(c => this.cardUpdatesSubject.next(c));
        });
    }
    createGiftCard(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataSrc = {
                brand: data.name,
                clientId: data.uuid,
                invoiceId: data.invoiceId,
                accessKey: data.accessKey
            };
            const name = data.name;
            const cardConfig = yield this.getCardConfig(name);
            const url = `${this.getApiPath()}/redeem`;
            return this.http
                .post(url, dataSrc)
                .catch(err => {
                this.logger.error(`${cardConfig.name} Gift Card Create/Update: ${err.message}`);
                const errMessage = err.error && err.error.message;
                const pendingMessages = [
                    'Card creation delayed',
                    'Invoice is unpaid or payment has not confirmed'
                ];
                return pendingMessages.indexOf(errMessage) > -1 ||
                    errMessage.indexOf('Please wait') > -1
                    ? of(Object.assign(Object.assign({}, data), { status: 'PENDING' }))
                    : Observable.throw(err);
            })
                .map((res) => {
                const status = res.claimCode || res.claimLink ? 'SUCCESS' : 'PENDING';
                const fullCard = Object.assign(Object.assign(Object.assign({}, data), res), { name,
                    status });
                this.logger.info(`${cardConfig.name} Gift Card Create/Update: ${fullCard.status}`);
                return fullCard;
            })
                .toPromise();
        });
    }
    updatePendingGiftCards(cards) {
        const cardsNeedingUpdate = cards.filter(card => this.checkIfCardNeedsUpdate(card));
        return from(cardsNeedingUpdate).pipe(switchMap(card => fromPromise(this.createGiftCard(card)).catch(err => {
            this.logger.error('Error creating gift card:', err);
            this.logger.error('Gift card: ', JSON.stringify(card, null, 4));
            return of(Object.assign(Object.assign({}, card), { status: 'FAILURE' }));
        })), switchMap(card => card.status === 'UNREDEEMED' || card.status === 'PENDING'
            ? fromPromise(this.getBitPayInvoice(card.invoiceId).then(invoice => (Object.assign(Object.assign({}, card), { status: (card.status === 'PENDING' ||
                    (card.status === 'UNREDEEMED' &&
                        invoice.status !== 'new')) &&
                    invoice.status !== 'expired' &&
                    invoice.status !== 'invalid'
                    ? 'PENDING'
                    : 'expired' }))))
            : of(card)), switchMap(updatedCard => this.updatePreviouslyPendingCard(updatedCard)), switchMap(updatedCard => {
            this.logger.debug('Gift card updated');
            return of(updatedCard);
        }));
    }
    updatePreviouslyPendingCard(updatedCard) {
        return fromPromise(this.saveGiftCard(updatedCard, {
            remove: updatedCard.status === 'expired'
        }).then(() => updatedCard));
    }
    checkIfCardNeedsUpdate(card) {
        if (!card.invoiceId) {
            return false;
        }
        // Continues normal flow (update card)
        if (card.status === 'PENDING' ||
            card.status === 'UNREDEEMED' ||
            card.status === 'invalid' ||
            (!card.claimCode && !card.claimLink)) {
            return true;
        }
        // Check if card status FAILURE for 24 hours
        if (card.status === 'FAILURE' &&
            this.timeProvider.withinPastDay(card.date)) {
            return true;
        }
        // Success: do not update
        return false;
    }
    getSupportedCards() {
        return __awaiter(this, void 0, void 0, function* () {
            const [availableCards, cachedApiCardConfig] = yield Promise.all([
                this.getAvailableCards().catch(err => {
                    this.logger.error('Error calling getAvailableCards in getSupportedCards', err);
                    this.clearCardConfigCache();
                    return [];
                }),
                this.getCachedApiCardConfig().catch(_ => ({}))
            ]);
            const cachedCardNames = Object.keys(cachedApiCardConfig);
            const availableCardNames = availableCards.map(c => c.name);
            const uniqueCardNames = Array.from(new Set([...availableCardNames, ...cachedCardNames]));
            const supportedCards = uniqueCardNames
                .map(cardName => {
                const freshConfig = availableCards.find(c => c.name === cardName);
                const cachedConfig = appendFallbackImages(cachedApiCardConfig[cardName]);
                const config = freshConfig || cachedConfig;
                const displayName = config.displayName || config.brand || config.name;
                return Object.assign(Object.assign({}, config), { displayName });
            })
                .filter(filterDisplayableConfig)
                .sort(sortByDisplayName);
            return supportedCards;
        });
    }
    getSupportedCardMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const supportedCards = yield this.getSupportedCards();
            return supportedCards.reduce((map, cardConfig) => (Object.assign(Object.assign({}, map), { [cardConfig.name]: cardConfig })), {});
        });
    }
    migrateAndFetchActiveCards() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clearActiveGiftCards();
            const purchasedBrands = yield this.getPurchasedBrands();
            const activeCardsGroupedByBrand = purchasedBrands.filter(cards => cards.filter(c => !c.archived).length);
            const activeCards = activeCardsGroupedByBrand
                .reduce((allCards, brandCards) => [...allCards, ...brandCards], [])
                .filter(c => !c.archived);
            yield this.updateActiveCards(activeCards);
            return activeCards;
        });
    }
    fetchAvailableCardMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const shouldSync = yield this.shouldSyncGiftCardPurchasesWithBitPayId();
            const availableCardMap = shouldSync
                ? yield this.fetchAuthenticatedAvailableCardMap()
                : yield this.fetchPublicAvailableCardMap();
            this.cacheApiCardConfig(availableCardMap);
            this.logger.debug('fetched available card map', shouldSync ? 'synced' : 'unsynced');
            return availableCardMap;
        });
    }
    fetchPublicAvailableCardMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.credentials.BITPAY_API_URL}/gift-cards/cards`;
            return this.http
                .get(url, {
                headers: {
                    'x-bitpay-version': this.appProvider.info.version
                }
            })
                .toPromise();
        });
    }
    fetchAuthenticatedAvailableCardMap() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bitpayIdProvider.apiCall('getGiftCardCatalog', {
                bitpayVersion: this.appProvider.info.version
            });
        });
    }
    cacheApiCardConfig(availableCardMap) {
        return __awaiter(this, void 0, void 0, function* () {
            const cardNames = Object.keys(availableCardMap);
            const previousCache = yield this.persistenceProvider.getGiftCardConfigCache(this.getNetwork());
            const apiCardConfigCache = getCardConfigFromApiConfigMap(availableCardMap, this.platformProvider.isCordova).reduce((configMap, apiCardConfigMap, index) => {
                const name = cardNames[index];
                return Object.assign(Object.assign({}, configMap), { [name]: apiCardConfigMap });
            }, {});
            const newCache = Object.assign(Object.assign({}, previousCache), apiCardConfigCache);
            if (JSON.stringify(previousCache) !== JSON.stringify(newCache)) {
                yield this.persistenceProvider.setGiftCardConfigCache(this.getNetwork(), newCache);
            }
        });
    }
    fetchCachedApiCardConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cachedApiCardConfigPromise = this.persistenceProvider.getGiftCardConfigCache(this.getNetwork());
            return this.cachedApiCardConfigPromise;
        });
    }
    getCachedApiCardConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = this.cachedApiCardConfigPromise
                ? yield this.cachedApiCardConfigPromise
                : yield this.fetchCachedApiCardConfig();
            this.logger.debug('got cached api card config');
            return config || {};
        });
    }
    savePhone(phone, phoneCountryInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this.persistenceProvider.setPhone(phone),
                this.persistenceProvider.setPhoneCountryInfo(phoneCountryInfo)
            ]);
        });
    }
    getPhoneAndCountryCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const [phone, phoneCountryInfo] = yield Promise.all([
                this.persistenceProvider.getPhone(),
                this.persistenceProvider.getPhoneCountryInfo()
            ]);
            return {
                phone: phone && `${phone}`,
                phoneCountryInfo: phoneCountryInfo || {
                    phoneCountryCode: '',
                    countryIsoCode: ''
                }
            };
        });
    }
    getCountry() {
        return __awaiter(this, void 0, void 0, function* () {
            this.countryPromise = this.countryPromise
                ? this.countryPromise
                : this.http
                    .get('https://bitpay.com/wallet-card/location')
                    .map((res) => res.country)
                    .toPromise()
                    .catch(_ => 'US');
            return this.countryPromise;
        });
    }
    getAvailableCards() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.availableCardsPromise
                ? this.availableCardsPromise
                : this.fetchAvailableCards();
        });
    }
    fetchAvailableCards() {
        return __awaiter(this, void 0, void 0, function* () {
            this.availableCardsPromise = Promise.all([
                this.fetchAvailableCardMap()
            ]).then(([availableCardMap]) => getCardConfigFromApiConfigMap(availableCardMap, this.platformProvider.isCordova)
                .map(apiCardConfig => (Object.assign(Object.assign({}, apiCardConfig), { displayName: apiCardConfig.displayName || apiCardConfig.name, tags: apiCardConfig.tags || [] })))
                .filter(filterDisplayableConfig)
                .sort(sortByDisplayName));
            return this.availableCardsPromise;
        });
    }
    preloadImages() {
        return __awaiter(this, void 0, void 0, function* () {
            const supportedCards = yield this.getSupportedCards();
            const imagesPerCard = supportedCards
                .map(c => [c.icon, c.cardImage])
                .filter(images => images[0] && images[1]);
            const fetchBatches = imagesPerCard.map(images => () => __awaiter(this, void 0, void 0, function* () { return Promise.all(images.map(i => this.imageLoader.preload(i))); }));
            yield promiseSerial(fetchBatches);
        });
    }
    logEvent(eventName, eventParams) {
        if (this.getNetwork() !== Network.livenet)
            return;
        this.analyticsProvider.logEvent(eventName, eventParams);
    }
    getPromoEventParams(promotedCard, context) {
        const discount = promotedCard.discounts && promotedCard.discounts[0];
        const promo = promotedCard.promotions && promotedCard.promotions[0];
        return Object.assign({ brand: promotedCard.name, name: (discount && discount.code) || promo.shortDescription, context, type: (discount && discount.type) || 'promo' }, (discount && { discountAmount: discount && discount.amount }));
    }
    register() {
        this.homeIntegrationsProvider.register({
            name: 'giftcards',
            title: 'Gift Cards',
            icon: 'assets/img/gift-cards/gift-cards-icon.svg',
            show: !!this.configProvider.get().showIntegration['giftcards'],
            type: 'card'
        });
    }
};
GiftCardProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AnalyticsProvider,
        AppProvider,
        BitPayIdProvider,
        ConfigProvider,
        Events,
        ImageLoader,
        HomeIntegrationsProvider,
        TimeProvider,
        EmailNotificationsProvider,
        HttpClient,
        Logger,
        PersistenceProvider,
        PlatformProvider])
], GiftCardProvider);
export { GiftCardProvider };
function getCardConfigFromApiConfigMap(availableCardMap, isCordova) {
    const cardNames = Object.keys(availableCardMap);
    const availableCards = cardNames
        .filter(cardName => availableCardMap[cardName] && availableCardMap[cardName].length)
        .map(cardName => getCardConfigFromApiBrandConfig(cardName, availableCardMap[cardName]))
        .map(cardConfig => removeDiscountsIfNotMobile(cardConfig, isCordova));
    return availableCards;
}
function removeDiscountsIfNotMobile(cardConfig, isCordova) {
    return Object.assign(Object.assign({}, cardConfig), { discounts: isCordova ? cardConfig.discounts : undefined, promotions: isCordova ? cardConfig.promotions : undefined });
}
function getCardConfigFromApiBrandConfig(cardName, apiBrandConfig) {
    const cards = apiBrandConfig;
    const [firstCard] = cards;
    const { currency } = firstCard;
    const range = cards.find(c => !!(c.maxAmount || c.minAmount) && c.currency === currency);
    const fixed = cards.filter(c => c.amount && c.currency);
    const supportedAmounts = fixed
        .reduce((newSupportedAmounts, currentCard) => [
        ...newSupportedAmounts,
        currentCard.amount
    ], [])
        .sort((a, b) => a - b);
    const activationFees = cards
        .filter(c => c.activationFees)
        .reduce((allFees, card) => allFees.concat(card.activationFees), []);
    const { amount, type, maxAmount, minAmount } = firstCard, config = __rest(firstCard, ["amount", "type", "maxAmount", "minAmount"]);
    const baseConfig = Object.assign(Object.assign({}, config), { name: cardName, activationFees });
    return range
        ? Object.assign(Object.assign({}, baseConfig), { minAmount: range.minAmount < 1 ? 1 : range.minAmount, maxAmount: range.maxAmount }) : Object.assign(Object.assign({}, baseConfig), { supportedAmounts });
}
export function getActivationFee(amount, cardConfig) {
    const activationFees = (cardConfig && cardConfig.activationFees) || [];
    const fixedFee = activationFees.find(fee => fee.type === 'fixed' &&
        amount >= fee.amountRange.min &&
        amount <= fee.amountRange.max);
    return (fixedFee && fixedFee.fee) || 0;
}
export function filterDisplayableConfig(cardConfig) {
    return (cardConfig.logo &&
        cardConfig.icon &&
        cardConfig.cardImage &&
        !cardConfig.hidden);
}
export function sortByDescendingDate(a, b) {
    return a.date < b.date ? 1 : -1;
}
export function sortByDisplayName(a, b) {
    const aSortValue = getDisplayNameSortValue(a.displayName);
    const bSortValue = getDisplayNameSortValue(b.displayName);
    return aSortValue > bSortValue ? 1 : -1;
}
export function getDisplayNameSortValue(displayName) {
    const startsNumeric = value => /^[0-9]$/.test(value.charAt(0));
    const name = displayName.toLowerCase();
    return `${startsNumeric(name) ? 'zzz' : ''}${name}`;
}
export function setNullableCardFields(card, cardConfig) {
    return Object.assign(Object.assign({}, card), { name: cardConfig.name, displayName: cardConfig.displayName, currency: card.currency || getCurrencyFromLegacySavedCard(cardConfig.name) });
}
export function getCardsFromInvoiceMap(invoiceMap, configMap) {
    return Object.keys(invoiceMap)
        .map(invoiceId => invoiceMap[invoiceId])
        .filter(card => card.invoiceId && configMap[card.name])
        .map(card => setNullableCardFields(card, configMap[card.name]))
        .sort(sortByDescendingDate);
}
export function hasVisibleDiscount(cardConfig) {
    return !!getVisibleDiscount(cardConfig);
}
export function hasPromotion(cardConfig) {
    return !!(cardConfig.promotions && cardConfig.promotions[0]);
}
export function getPromo(cardConfig) {
    return (getVisibleDiscount(cardConfig) ||
        (cardConfig.promotions && cardConfig.promotions[0]));
}
export function getVisibleDiscount(cardConfig) {
    const discounts = cardConfig.discounts;
    const supportedDiscountTypes = ['flatrate', 'percentage'];
    return (discounts &&
        discounts.find(d => supportedDiscountTypes.includes(d.type) && !d.hidden));
}
function appendFallbackImages(cardConfig) {
    // For cards bought outside of the user's current IP catalog area before server-side
    // catalog management was implemented and card images were stored locally.
    const getBrandImagePath = brandName => {
        const cardImagePath = `https://bitpay.com/gift-cards/assets/`;
        const brandImageDirectory = brandName
            .toLowerCase()
            .replace(/[^0-9a-z]/gi, '');
        return `${cardImagePath}${brandImageDirectory}/`;
    };
    const getImagesForBrand = brandName => {
        const imagePath = getBrandImagePath(brandName);
        return {
            cardImage: `${imagePath}card.png`,
            icon: `${imagePath}icon.svg`,
            logo: `${imagePath}logo.svg`
        };
    };
    const needsFallback = cardConfig &&
        cardConfig.cardImage &&
        !cardConfig.cardImage.includes('https://bitpay.com');
    return needsFallback
        ? Object.assign(Object.assign({}, cardConfig), getImagesForBrand(cardConfig.name)) : cardConfig;
}
function getCurrencyFromLegacySavedCard(cardName) {
    switch (cardName) {
        case 'Amazon.com':
            return 'USD';
        case 'Amazon.co.jp':
            return 'JPY';
        case 'Mercado Livre':
            return 'BRL';
        default:
            return 'USD';
    }
}
//# sourceMappingURL=gift-card.js.map