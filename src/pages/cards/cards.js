import { __awaiter, __decorate, __metadata } from "tslib";
import { ChangeDetectorRef, Component } from '@angular/core';
// Providers
import { animate, style, transition, trigger } from '@angular/animations';
import { Events } from 'ionic-angular';
import { AppProvider, BitPayProvider, GiftCardProvider, HomeIntegrationsProvider, IABCardProvider, Logger, PersistenceProvider, PlatformProvider, TabProvider } from '../../providers';
import { Network } from '../../providers/persistence/persistence';
let CardsPage = class CardsPage {
    constructor(appProvider, platformProvider, homeIntegrationsProvider, bitPayProvider, giftCardProvider, persistenceProvider, tabProvider, events, iabCardProvider, changeRef, logger) {
        this.appProvider = appProvider;
        this.platformProvider = platformProvider;
        this.homeIntegrationsProvider = homeIntegrationsProvider;
        this.bitPayProvider = bitPayProvider;
        this.giftCardProvider = giftCardProvider;
        this.persistenceProvider = persistenceProvider;
        this.tabProvider = tabProvider;
        this.events = events;
        this.iabCardProvider = iabCardProvider;
        this.changeRef = changeRef;
        this.logger = logger;
        this.showBitPayCard = true;
        this.tapped = 0;
        this.initialized = false;
        this.waitList = true;
        this.NETWORK = this.bitPayProvider.getEnvironment().network;
        this.bitPayProvider.get('/countries', ({ data }) => {
            this.persistenceProvider.setCountries(data);
        }, () => { });
        this.events.subscribe('showHideUpdate', (status) => __awaiter(this, void 0, void 0, function* () {
            if (status === 'inProgress') {
                this.initialized = false;
            }
            else {
                this.bitpayCardItems = yield this.prepareDebitCards();
                setTimeout(() => {
                    this.initialized = true;
                    this.changeRef.detectChanges();
                });
            }
        }));
        this.events.subscribe('experimentUpdateStart', () => __awaiter(this, void 0, void 0, function* () {
            this.waitList = false;
            this.changeRef.detectChanges();
        }));
        this.events.subscribe('updateCards', (cards) => __awaiter(this, void 0, void 0, function* () {
            this.bitpayCardItems = yield this.prepareDebitCards(cards);
            this.changeRef.detectChanges();
        }));
        this.events.subscribe('BitPayId/Disconnected', () => __awaiter(this, void 0, void 0, function* () {
            this.hasCards = false;
        }));
    }
    ionViewWillEnter() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cardExperimentEnabled =
                (yield this.persistenceProvider.getCardExperimentFlag()) === 'enabled';
            if (this.cardExperimentEnabled) {
                this.waitList = false;
            }
            this.showGiftCards = this.homeIntegrationsProvider.shouldShowInHome('giftcards');
            this.showBitpayCardGetStarted = this.homeIntegrationsProvider.shouldShowInHome('debitcard');
            this.showBitPayCard =
                !(this.appProvider.info._enabledExtensions.debitcard == 'false') &&
                    this.platformProvider.isCordova;
            this.bitpayCardItems = yield this.prepareDebitCards();
            if (!this.tabReady) {
                this.throttledFetchAllCards();
            }
            this.tabReady = this.initialized = this.IABReady = true;
            this.changeRef.detectChanges();
        });
    }
    refresh(refresher) {
        setTimeout(() => {
            refresher.complete();
        }, 2000);
        this.throttledFetchAllCards();
    }
    prepareDebitCards(force) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('prepare called');
            return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
                if (!this.platformProvider.isCordova) {
                    return res();
                }
                // retrieve cards from storage
                let cards = force ||
                    (yield this.persistenceProvider.getBitpayDebitCards(Network[this.NETWORK]));
                /*
                  Adding this check as a safety - intermittently, when storage is getting updated with cards
                  a race condition can happen where cards returns an empty array.
                */
                if (this.bitpayCardItems && this.bitpayCardItems.length && !cards.length)
                    return res(this.bitpayCardItems);
                this.hasCards = cards.length > 0;
                if (!this.hasCards) {
                    return res();
                }
                // sort by provider
                this.iabCardProvider.sortCards(cards, ['galileo', 'firstView'], 'provider');
                const hasGalileo = cards.some(c => c.provider === 'galileo');
                // if all cards are hidden
                if (cards.every(c => !!c.hide)) {
                    // if galileo not found then show order card else hide it
                    if (!hasGalileo) {
                        this.showBitPayCard = true;
                        this.showDisclaimer = true;
                    }
                    else {
                        this.showBitPayCard = this.showDisclaimer = false;
                    }
                    return res(cards);
                }
                // if galileo then show disclaimer and remove add card ability
                if (hasGalileo) {
                    // only show cards that are active and if galileo only show virtual
                    cards = cards.filter(c => (c.provider === 'firstView' || c.cardType === 'virtual') &&
                        c.status === 'active');
                    this.showBitpayCardGetStarted = this.waitList = false;
                    this.showDisclaimer = !!cards
                        .filter(c => !c.hide)
                        .find(c => c.provider === 'galileo');
                    yield this.persistenceProvider.setReachedCardLimit(true);
                    this.events.publish('reachedCardLimit');
                }
                else {
                    if (this.waitList) {
                        // no MC so hide disclaimer
                        this.showDisclaimer = false;
                    }
                }
                this.showBitPayCard = true;
                res(cards);
            }));
        });
    }
    fetchBitpayCardItems() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hasCards && this.platformProvider.isCordova) {
                yield this.iabCardProvider.getBalances();
            }
        });
    }
    fetchActiveGiftCards() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeCards = yield this.tabProvider.activeGiftCardsPromise;
            const updatedActiveGiftCardsPromise = this.giftCardProvider.getActiveCards();
            this.activeCards = yield updatedActiveGiftCardsPromise;
            this.tabProvider.activeGiftCardsPromise = updatedActiveGiftCardsPromise;
        });
    }
    fetchAllCards() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                this.fetchBitpayCardItems(),
                this.fetchActiveGiftCards()
            ]);
        });
    }
    throttledFetchAllCards() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fetchLock) {
                this.logger.log('CARD - fetch already in progress');
                return;
            }
            this.logger.log('CARD - fetch started');
            this.fetchLock = true;
            yield this.fetchAllCards();
            this.logger.log('CARD - fetch complete');
            yield new Promise(res => setTimeout(res, 30000));
            this.fetchLock = false;
            this.logger.log('CARD - fetchLock reset');
        });
    }
    enableCard() {
        this.tapped++;
        if (this.tapped >= 10) {
            this.persistenceProvider.getCardExperimentFlag().then(res => {
                if (res === 'enabled') {
                    this.persistenceProvider.removeCardExperimentFlag();
                    this.persistenceProvider.setBitpayIdPairingFlag('disabled');
                    alert('Card experiment disabled. Restart the app.');
                }
                else {
                    this.persistenceProvider.setCardExperimentFlag('enabled');
                    this.persistenceProvider.setBitpayIdPairingFlag('enabled');
                    alert('Card experiment enabled.');
                }
                this.tapped = 0;
            });
        }
    }
};
CardsPage = __decorate([
    Component({
        selector: 'page-cards',
        templateUrl: 'cards.html',
        animations: [
            trigger('fade', [
                transition(':enter', [
                    style({
                        transform: 'translateY(20px)',
                        opacity: 0
                    }),
                    animate('400ms')
                ])
            ])
        ]
    }),
    __metadata("design:paramtypes", [AppProvider,
        PlatformProvider,
        HomeIntegrationsProvider,
        BitPayProvider,
        GiftCardProvider,
        PersistenceProvider,
        TabProvider,
        Events,
        IABCardProvider,
        ChangeDetectorRef,
        Logger])
], CardsPage);
export { CardsPage };
//# sourceMappingURL=cards.js.map