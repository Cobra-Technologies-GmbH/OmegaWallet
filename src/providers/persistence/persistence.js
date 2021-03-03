import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import * as _ from 'lodash';
import { Logger } from '../../providers/logger/logger';
import { PlatformProvider } from '../platform/platform';
import { FileStorage } from './storage/file-storage';
import { LocalStorage } from './storage/local-storage';
// TODO import { RamStorage } from './storage/ram-storage';
export var Network;
(function (Network) {
    Network["livenet"] = "livenet";
    Network["testnet"] = "testnet";
})(Network || (Network = {}));
const Keys = {
    ADDRESS_BOOK: network => 'addressbook-' + network,
    AGREE_DISCLAIMER: 'agreeDisclaimer',
    GIFT_CARD_USER_INFO: 'amazonUserInfo',
    APP_IDENTITY: network => 'appIdentity-' + network,
    BACKUP: walletId => 'backup-' + walletId,
    BACKUP_WALLET_GROUP: keyId => 'walletGroupBackup-' + keyId,
    TESTING_ADVERTISEMENTS: 'testingAdvertisements',
    BALANCE_CACHE: cardId => 'balanceCache-' + cardId,
    HISTORY_CACHE: cardId => 'historyCache-' + cardId,
    BITPAY_ACCOUNTS_V2: network => 'bitpayAccounts-v2-' + network,
    CLEAN_AND_SCAN_ADDRESSES: 'CleanAndScanAddresses',
    COINBASE_REFRESH_TOKEN: network => 'coinbaseRefreshToken-' + network,
    COINBASE_TOKEN: network => 'coinbaseToken-' + network,
    COINBASE_TXS: network => 'coinbaseTxs-' + network,
    COINBASE: env => 'coinbase-' + env,
    CONFIG: 'config',
    FEEDBACK: 'feedback',
    FOCUSED_WALLET_ID: 'focusedWalletId',
    GIFT_CARD_CONFIG_CACHE: (network) => {
        const suffix = network === Network.livenet ? '' : `-${network}`;
        return `giftCardConfigCache${suffix}`;
    },
    ACTIVE_GIFT_CARDS: (network) => {
        return `activeGiftCards-${network}`;
    },
    GIFT_CARDS: (cardName, network) => {
        const legacyGiftCardKey = getLegacyGiftCardKey(cardName, network);
        return legacyGiftCardKey || `giftCards-${cardName}-${network}`;
    },
    HIDE_GIFT_CARD_DISCOUNT_ITEM: 'hideGiftCardDiscountItem',
    HIDE_BALANCE: walletId => 'hideBalance-' + walletId,
    TOTAL_BALANCE: 'totalBalance',
    HIDE_WALLET: walletId => 'hideWallet-' + walletId,
    KEY_ONBOARDING: 'keyOnboarding',
    KEYS: 'keys',
    LAST_ADDRESS: walletId => 'lastAddress-' + walletId,
    LAST_CURRENCY_USED: 'lastCurrencyUsed',
    LAST_COUNTRY_USED: 'buyCryptoLastCountry',
    PHONE: 'phone',
    PHONE_COUNTRY_INFO: 'phoneCountryInfo',
    PROFILE: 'profile',
    PROFILE_OLD: 'profileOld',
    REMOTE_PREF_STORED: 'remotePrefStored',
    TX_CONFIRM_NOTIF: txid => 'txConfirmNotif-' + txid,
    TX_HISTORY: walletId => 'txsHistory-' + walletId,
    ORDER_WALLET: walletId => 'order-' + walletId,
    ORDER_WALLET_GROUP: keyId => 'order-' + keyId,
    SERVER_MESSAGE_DISMISSED: messageId => 'serverMessageDismissed-' + messageId,
    RELEASE_MESSAGE_DISMISSED: 'releaseMessageDismissed',
    ADVERTISEMENT_DISMISSED: name => 'advertisementDismissed-' + name,
    WALLET_GROUP_NAME: keyId => `Key-${keyId}`,
    BITPAY_ID_PAIRING_TOKEN: network => `bitpayIdToken-${network}`,
    BITPAY_ID_USER_INFO: network => `bitpayIdUserInfo-${network}`,
    BITPAY_ID_SETTINGS: network => `bitpayIdSettings-${network}`,
    APP_THEME: 'app-theme',
    USER_LOCATION: 'user-location',
    COUNTRIES: 'countries',
    CARD_FAST_TRACK_ENABLED: 'cardFastTrackEnabled',
    TEMP_MDES_DEBUG_FLAG: 'tempMdesDebugFlag',
    TEMP_MDES_CERT_ONLY_DEBUG_FLAG: 'tempMdesCertOnlyDebugFlag'
};
let PersistenceProvider = class PersistenceProvider {
    constructor(logger, platform, file) {
        this.logger = logger;
        this.platform = platform;
        this.file = file;
        this.logger.debug('PersistenceProvider initialized');
    }
    load() {
        this.storage = this.platform.isCordova
            ? new FileStorage(this.file, this.logger)
            : new LocalStorage(this.logger);
    }
    storeProfileLegacy(profileOld) {
        return this.storage.set(Keys.PROFILE_OLD, profileOld);
    }
    getProfileLegacy() {
        return this.storage.get(Keys.PROFILE_OLD);
    }
    removeProfileLegacy() {
        return this.storage.remove(Keys.PROFILE_OLD);
    }
    storeNewProfile(profile) {
        return this.storage.create(Keys.PROFILE, profile);
    }
    storeProfile(profile) {
        return this.storage.set(Keys.PROFILE, profile);
    }
    getProfile() {
        return new Promise(resolve => {
            this.storage.get(Keys.PROFILE).then(profile => {
                resolve(profile);
            });
        });
    }
    setKeys(keys) {
        return this.storage.set(Keys.KEYS, keys);
    }
    getKeys() {
        return this.storage.get(Keys.KEYS);
    }
    setFeedbackInfo(feedbackValues) {
        return this.storage.set(Keys.FEEDBACK, feedbackValues);
    }
    getFeedbackInfo() {
        return this.storage.get(Keys.FEEDBACK);
    }
    setKeyOnboardingFlag() {
        return this.storage.set(Keys.KEY_ONBOARDING, true);
    }
    getKeyOnboardingFlag() {
        return this.storage.get(Keys.KEY_ONBOARDING);
    }
    storeFocusedWalletId(walletId) {
        return this.storage.set(Keys.FOCUSED_WALLET_ID, walletId || '');
    }
    getFocusedWalletId() {
        return this.storage.get(Keys.FOCUSED_WALLET_ID);
    }
    getLastAddress(walletId) {
        return this.storage.get(Keys.LAST_ADDRESS(walletId));
    }
    storeLastAddress(walletId, address) {
        return this.storage.set(Keys.LAST_ADDRESS(walletId), address);
    }
    clearLastAddress(walletId) {
        return this.storage.remove(Keys.LAST_ADDRESS(walletId));
    }
    setBackupFlag(walletId) {
        return this.storage.set(Keys.BACKUP(walletId), Date.now());
    }
    getBackupFlag(walletId) {
        return this.storage.get(Keys.BACKUP(walletId));
    }
    clearBackupFlag(walletId) {
        return this.storage.remove(Keys.BACKUP(walletId));
    }
    getPhone() {
        return this.storage.get(Keys.PHONE);
    }
    setPhone(phone) {
        return this.storage.set(Keys.PHONE, phone);
    }
    getPhoneCountryInfo() {
        return this.storage.get(Keys.PHONE_COUNTRY_INFO);
    }
    setPhoneCountryInfo(phoneCountryInfo) {
        return this.storage.set(Keys.PHONE_COUNTRY_INFO, phoneCountryInfo);
    }
    setBackupGroupFlag(keyId, timestamp) {
        timestamp = timestamp || Date.now();
        return this.storage.set(Keys.BACKUP_WALLET_GROUP(keyId), timestamp);
    }
    getBackupGroupFlag(keyId) {
        return this.storage.get(Keys.BACKUP_WALLET_GROUP(keyId));
    }
    clearBackupGroupFlag(keyId) {
        return this.storage.remove(Keys.BACKUP_WALLET_GROUP(keyId));
    }
    setCleanAndScanAddresses(walletId) {
        return this.storage.set(Keys.CLEAN_AND_SCAN_ADDRESSES, walletId);
    }
    setTestingAdvertisements(isViewingTestAdvertisements) {
        return this.storage.set(Keys.TESTING_ADVERTISEMENTS, isViewingTestAdvertisements);
    }
    getTestingAdvertisments() {
        return this.storage.get(Keys.TESTING_ADVERTISEMENTS);
    }
    removeTestingAdvertisments() {
        return this.storage.remove(Keys.TESTING_ADVERTISEMENTS);
    }
    getCleanAndScanAddresses() {
        return this.storage.get(Keys.CLEAN_AND_SCAN_ADDRESSES);
    }
    removeCleanAndScanAddresses() {
        return this.storage.remove(Keys.CLEAN_AND_SCAN_ADDRESSES);
    }
    getConfig() {
        return this.storage.get(Keys.CONFIG);
    }
    storeConfig(config) {
        return this.storage.set(Keys.CONFIG, config);
    }
    clearConfig() {
        return this.storage.remove(Keys.CONFIG);
    }
    setHideBalanceFlag(walletId, val) {
        return this.storage.set(Keys.HIDE_BALANCE(walletId), val);
    }
    getHideBalanceFlag(walletId) {
        return this.storage.get(Keys.HIDE_BALANCE(walletId));
    }
    setTotalBalance(data) {
        return this.storage.set(Keys.TOTAL_BALANCE, data);
    }
    getTotalBalance() {
        return this.storage.get(Keys.TOTAL_BALANCE);
    }
    setHideWalletFlag(walletId, val) {
        return this.storage.set(Keys.HIDE_WALLET(walletId), val);
    }
    getHideWalletFlag(walletId) {
        return this.storage.get(Keys.HIDE_WALLET(walletId));
    }
    setDisclaimerAccepted() {
        return this.storage.set(Keys.AGREE_DISCLAIMER, true);
    }
    // for compatibility
    getCopayDisclaimerFlag() {
        return this.storage.get(Keys.AGREE_DISCLAIMER);
    }
    setRemotePrefsStoredFlag() {
        return this.storage.set(Keys.REMOTE_PREF_STORED, true);
    }
    getRemotePrefsStoredFlag() {
        return this.storage.get(Keys.REMOTE_PREF_STORED);
    }
    setCoinbase(env, data) {
        return this.storage.set(Keys.COINBASE(env), data);
    }
    getCoinbase(env) {
        return this.storage.get(Keys.COINBASE(env));
    }
    removeCoinbase(env) {
        return this.storage.remove(Keys.COINBASE(env));
    }
    setCoinbaseToken(network, token) {
        return this.storage.set(Keys.COINBASE_TOKEN(network), token);
    }
    getCoinbaseToken(network) {
        return this.storage.get(Keys.COINBASE_TOKEN(network));
    }
    removeCoinbaseToken(network) {
        return this.storage.remove(Keys.COINBASE_TOKEN(network));
    }
    setCoinbaseRefreshToken(network, token) {
        return this.storage.set(Keys.COINBASE_REFRESH_TOKEN(network), token);
    }
    getCoinbaseRefreshToken(network) {
        return this.storage.get(Keys.COINBASE_REFRESH_TOKEN(network));
    }
    removeCoinbaseRefreshToken(network) {
        return this.storage.remove(Keys.COINBASE_REFRESH_TOKEN(network));
    }
    setCoinbaseTxs(network, ctx) {
        return this.storage.set(Keys.COINBASE_TXS(network), ctx);
    }
    getCoinbaseTxs(network) {
        return this.storage.get(Keys.COINBASE_TXS(network));
    }
    removeCoinbaseTxs(network) {
        return this.storage.remove(Keys.COINBASE_TXS(network));
    }
    setAddressBook(network, addressbook) {
        return this.storage.set(Keys.ADDRESS_BOOK(network), addressbook);
    }
    getAddressBook(network) {
        return this.storage.get(Keys.ADDRESS_BOOK(network));
    }
    removeAddressbook(network) {
        return this.storage.remove(Keys.ADDRESS_BOOK(network));
    }
    setLastCurrencyUsed(lastCurrencyUsed) {
        return this.storage.set(Keys.LAST_CURRENCY_USED, lastCurrencyUsed);
    }
    getLastCurrencyUsed() {
        return this.storage.get(Keys.LAST_CURRENCY_USED);
    }
    setLastCountryUsed(lastCountryUsed) {
        return this.storage.set(Keys.LAST_COUNTRY_USED, lastCountryUsed);
    }
    getLastCountryUsed() {
        return this.storage.get(Keys.LAST_COUNTRY_USED);
    }
    checkQuota() {
        let block = '';
        // 50MB
        for (let i = 0; i < 1024 * 1024; ++i) {
            block += '12345678901234567890123456789012345678901234567890';
        }
        this.storage.set('test', block).catch(err => {
            this.logger.error('CheckQuota Return:' + err);
        });
    }
    setTxHistory(walletId, txs) {
        return this.storage.set(Keys.TX_HISTORY(walletId), txs).catch(err => {
            this.logger.error('Error saving tx History. Size:' + txs.length);
            this.logger.error(err);
        });
    }
    getTxHistory(walletId) {
        return this.storage.get(Keys.TX_HISTORY(walletId));
    }
    removeTxHistory(walletId) {
        return this.storage.remove(Keys.TX_HISTORY(walletId));
    }
    setLastKnownHistory(id, txs) {
        let updatedOn = Math.floor(Date.now() / 1000);
        return this.storage.set(Keys.HISTORY_CACHE(id), {
            updatedOn,
            txs
        });
    }
    getLastKnownHistory(id) {
        return this.storage.get(Keys.HISTORY_CACHE(id));
    }
    setLastKnownBalance(id, balance) {
        let updatedOn = Math.floor(Date.now() / 1000);
        return this.storage.set(Keys.BALANCE_CACHE(id), {
            updatedOn,
            balance
        });
    }
    getLastKnownBalance(id) {
        return this.storage.get(Keys.BALANCE_CACHE(id));
    }
    removeLastKnownBalance(id) {
        return this.storage.remove(Keys.BALANCE_CACHE(id));
    }
    setAppIdentity(network, data) {
        return this.storage.set(Keys.APP_IDENTITY(network), data);
    }
    getAppIdentity(network) {
        return this.storage.get(Keys.APP_IDENTITY(network));
    }
    removeAppIdentity(network) {
        return this.storage.remove(Keys.APP_IDENTITY(network));
    }
    removeAllWalletData(walletId) {
        this.clearLastAddress(walletId);
        this.removeTxHistory(walletId);
        this.clearBackupFlag(walletId);
        this.removeWalletOrder(walletId);
    }
    removeAllWalletGroupData(keyId) {
        this.clearBackupGroupFlag(keyId);
    }
    getActiveGiftCards(network) {
        return this.storage.get(Keys.ACTIVE_GIFT_CARDS(network));
    }
    setActiveGiftCards(network, data) {
        return this.storage.set(Keys.ACTIVE_GIFT_CARDS(network), data);
    }
    getGiftCardConfigCache(network) {
        return this.storage.get(Keys.GIFT_CARD_CONFIG_CACHE(network));
    }
    removeGiftCardConfigCache(network) {
        return this.storage.remove(Keys.GIFT_CARD_CONFIG_CACHE(network));
    }
    setGiftCardConfigCache(network, data) {
        return this.storage.set(Keys.GIFT_CARD_CONFIG_CACHE(network), data);
    }
    setGiftCardUserInfo(data) {
        return this.storage.set(Keys.GIFT_CARD_USER_INFO, data);
    }
    getGiftCardUserInfo() {
        return this.storage.get(Keys.GIFT_CARD_USER_INFO);
    }
    removeGiftCardUserInfo() {
        return this.storage.remove(Keys.GIFT_CARD_USER_INFO);
    }
    setHideGiftCardDiscountItem(data) {
        return this.storage.set(Keys.HIDE_GIFT_CARD_DISCOUNT_ITEM, data);
    }
    getHideGiftCardDiscountItem() {
        return this.storage.get(Keys.HIDE_GIFT_CARD_DISCOUNT_ITEM);
    }
    removeHideGiftCardDiscountItem() {
        return this.storage.remove(Keys.HIDE_GIFT_CARD_DISCOUNT_ITEM);
    }
    setTxConfirmNotification(txid, val) {
        return this.storage.set(Keys.TX_CONFIRM_NOTIF(txid), val);
    }
    getTxConfirmNotification(txid) {
        return this.storage.get(Keys.TX_CONFIRM_NOTIF(txid));
    }
    removeTxConfirmNotification(txid) {
        return this.storage.remove(Keys.TX_CONFIRM_NOTIF(txid));
    }
    getBitpayAccounts(network) {
        return this.storage.get(Keys.BITPAY_ACCOUNTS_V2(network));
    }
    setBitpayAccount(network, data) {
        return this.getBitpayAccounts(network).then(allAccounts => {
            allAccounts = allAccounts || {};
            let account = allAccounts[data.email] || {};
            account.token = data.token;
            account.familyName = data.familyName;
            account.givenName = data.givenName;
            allAccounts[data.email] = account;
            this.logger.info('Storing Omega Accounts with new account:' + data.email);
            return this.storage.set(Keys.BITPAY_ACCOUNTS_V2(network), allAccounts);
        });
    }
    removeBitpayAccount(network, email) {
        return this.getBitpayAccounts(network).then(allAccounts => {
            allAccounts = allAccounts || {};
            delete allAccounts[email];
            return this.storage.set(Keys.BITPAY_ACCOUNTS_V2(network), allAccounts);
        });
    }
    removeBitpayAccountV2(network) {
        return this.storage.set(Keys.BITPAY_ACCOUNTS_V2(network), {});
    }
    setBitpayDebitCards(network, email, cards) {
        return this.storage.set(Keys.BITPAY_ACCOUNTS_V2(network), {
            [email]: { cards }
        });
    }
    setCountries(countries) {
        return this.storage.set(Keys.COUNTRIES, countries);
    }
    getCountries() {
        return this.storage.get(Keys.COUNTRIES);
    }
    // cards: [
    //   eid: card id
    //   id: card id
    //   lastFourDigits: card number
    //   token: card token
    //   email: account email
    // ]
    getBitpayDebitCards(network) {
        return this.getBitpayAccounts(network).then(allAccounts => {
            let allCards = [];
            _.each(allAccounts, (account, email) => {
                if (account.cards) {
                    // Add account's email to each card
                    var cards = _.clone(account.cards);
                    _.each(cards, x => {
                        x.email = email;
                    });
                    allCards = allCards.concat(cards);
                }
            });
            return allCards;
        });
    }
    removeBitpayDebitCard(network, cardEid) {
        return this.getBitpayAccounts(network)
            .then(allAccounts => {
            return _.each(allAccounts, account => {
                account.cards = _.reject(account.cards, {
                    eid: cardEid
                });
            });
        })
            .then(allAccounts => {
            return this.storage.set(Keys.BITPAY_ACCOUNTS_V2(network), allAccounts);
        });
    }
    removeAllBitPayAccounts(network) {
        return this.storage.set(Keys.BITPAY_ACCOUNTS_V2(network), {});
    }
    setGiftCards(cardName, network, gcs) {
        return this.storage.set(Keys.GIFT_CARDS(cardName, network), gcs);
    }
    getGiftCards(cardName, network) {
        return this.storage.get(Keys.GIFT_CARDS(cardName, network));
    }
    setServerMessageDismissed(id) {
        return this.storage.set(Keys.SERVER_MESSAGE_DISMISSED(id), 'dismissed');
    }
    getServerMessageDismissed(id) {
        return this.storage.get(Keys.SERVER_MESSAGE_DISMISSED(id));
    }
    removeServerMessageDismissed(id) {
        return this.storage.remove(Keys.SERVER_MESSAGE_DISMISSED(id));
    }
    setNewReleaseMessageDismissed(version) {
        return this.storage.set(Keys.RELEASE_MESSAGE_DISMISSED, version);
    }
    getNewReleaseMessageDismissed() {
        return this.storage.get(Keys.RELEASE_MESSAGE_DISMISSED);
    }
    setAdvertisementDismissed(name) {
        return this.storage.set(Keys.ADVERTISEMENT_DISMISSED(name), 'dismissed');
    }
    getAdvertisementDismissed(name) {
        return this.storage.get(Keys.ADVERTISEMENT_DISMISSED(name));
    }
    removeAdvertisementDismissed(name) {
        return this.storage.remove(Keys.ADVERTISEMENT_DISMISSED(name));
    }
    setChangelly(env, tx) {
        return this.storage.set('changelly-' + env, tx);
    }
    getChangelly(env) {
        return this.storage.get('changelly-' + env);
    }
    removeChangelly(env) {
        return this.storage.remove('changelly-' + env);
    }
    setSimplex(env, paymentRequests) {
        return this.storage.set('simplex-' + env, paymentRequests);
    }
    getSimplex(env) {
        return this.storage.get('simplex-' + env);
    }
    removeSimplex(env) {
        return this.storage.remove('simplex-' + env);
    }
    setWyre(env, paymentRequests) {
        return this.storage.set('wyre-' + env, paymentRequests);
    }
    getWyre(env) {
        return this.storage.get('wyre-' + env);
    }
    removeWyre(env) {
        return this.storage.remove('wyre-' + env);
    }
    setWalletOrder(walletId, order) {
        return this.storage.set(Keys.ORDER_WALLET(walletId), order);
    }
    getWalletOrder(walletId) {
        return this.storage.get(Keys.ORDER_WALLET(walletId));
    }
    removeWalletOrder(walletId) {
        return this.storage.remove(Keys.ORDER_WALLET(walletId));
    }
    setWalletGroupOrder(keyId, order) {
        return this.storage.set(Keys.ORDER_WALLET_GROUP(keyId), order);
    }
    getWalletGroupOrder(keyId) {
        return this.storage.get(Keys.ORDER_WALLET_GROUP(keyId));
    }
    removeWalletGroupOrder(keyId) {
        return this.storage.remove(Keys.ORDER_WALLET_GROUP(keyId));
    }
    setLockStatus(isLocked) {
        return this.storage.set('lockStatus', isLocked);
    }
    getLockStatus() {
        return this.storage.get('lockStatus');
    }
    removeLockStatus() {
        return this.storage.remove('lockStatus');
    }
    setNewFeatureSlidesFlag(value) {
        return this.storage.set('newFeatureSlides', value);
    }
    getNewFeatureSlidesFlag() {
        return this.storage.get('newFeatureSlides');
    }
    removeNewFeatureSlidesFlag() {
        return this.storage.remove('newFeatureSlides');
    }
    setEmailLawCompliance(value) {
        return this.storage.set('emailLawCompliance', value);
    }
    getEmailLawCompliance() {
        return this.storage.get('emailLawCompliance');
    }
    removeEmailLawCompliance() {
        return this.storage.remove('emailLawCompliance');
    }
    setHiddenFeaturesFlag(value) {
        this.logger.debug('Hidden features: ', value);
        return this.storage.set('hiddenFeatures', value);
    }
    getHiddenFeaturesFlag() {
        return this.storage.get('hiddenFeatures');
    }
    removeHiddenFeaturesFlag() {
        return this.storage.remove('hiddenFeatures');
    }
    setCardExperimentFlag(value) {
        return this.storage.set('cardExperimentEnabled', value);
    }
    getCardExperimentFlag() {
        return this.storage.get('cardExperimentEnabled');
    }
    removeCardExperimentFlag() {
        return this.storage.remove('cardExperimentEnabled');
    }
    getCardExperimentNetwork() {
        return this.storage.get('cardExperimentNetwork');
    }
    setCardExperimentNetwork(network) {
        return this.storage.set('cardExperimentNetwork', network);
    }
    setWalletGroupName(keyId, name) {
        return this.storage.set(Keys.WALLET_GROUP_NAME(keyId), name);
    }
    getWalletGroupName(keyId) {
        return this.storage.get(Keys.WALLET_GROUP_NAME(keyId));
    }
    removeWalletGroupName(keyId) {
        return this.storage.remove(Keys.WALLET_GROUP_NAME(keyId));
    }
    setBitPayIdPairingToken(network, token) {
        return this.storage.set(Keys.BITPAY_ID_PAIRING_TOKEN(network), token);
    }
    getBitPayIdPairingToken(network) {
        return this.storage.get(Keys.BITPAY_ID_PAIRING_TOKEN(network));
    }
    removeBitPayIdPairingToken(network) {
        return this.storage.remove(Keys.BITPAY_ID_PAIRING_TOKEN(network));
    }
    setBitPayIdUserInfo(network, userInfo) {
        return this.storage.set(Keys.BITPAY_ID_USER_INFO(network), userInfo);
    }
    getBitPayIdUserInfo(network) {
        return this.storage.get(Keys.BITPAY_ID_USER_INFO(network));
    }
    removeBitPayIdUserInfo(network) {
        return this.storage.remove(Keys.BITPAY_ID_USER_INFO(network));
    }
    setBitPayIdSettings(network, userSettings) {
        return this.storage.set(Keys.BITPAY_ID_SETTINGS(network), userSettings);
    }
    getBitPayIdSettings(network) {
        return this.storage.get(Keys.BITPAY_ID_SETTINGS(network));
    }
    setCardNotificationBadge(value) {
        return this.storage.set('cardNotificationBadge', value);
    }
    getCardNotificationBadge() {
        return this.storage.get('cardNotificationBadge');
    }
    removeBitPayIdSettings(network) {
        return this.storage.remove(Keys.BITPAY_ID_SETTINGS(network));
    }
    setBitpayIdPairingFlag(value) {
        this.logger.debug('card experiment enabled: ', value);
        return this.storage.set('BitpayIdPairingFlag', value);
    }
    getBitpayIdPairingFlag() {
        return this.storage.get('BitpayIdPairingFlag');
    }
    removeBitpayIdPairingFlag() {
        return this.storage.remove('BitpayIdPairingFlag');
    }
    getWalletConnect() {
        return this.storage.get('walletConnectSession');
    }
    setWalletConnect(session) {
        return this.storage.set('walletConnectSession', session);
    }
    removeWalletConnect() {
        return this.storage.remove('walletConnectSession');
    }
    setWaitingListStatus(onList) {
        return this.storage.set('waitingListStatus', onList);
    }
    getWaitingListStatus() {
        return this.storage.get('waitingListStatus');
    }
    removeWaitingListStatus() {
        return this.storage.remove('waitingListStatus');
    }
    setReachedCardLimit(reachedCardLimit) {
        return this.storage.set('reachedCardLimit', reachedCardLimit);
    }
    getReachedCardLimit() {
        return this.storage.get('reachedCardLimit');
    }
    setAppTheme(value) {
        return this.storage.set(Keys.APP_THEME, value);
    }
    getAppTheme() {
        return this.storage.get(Keys.APP_THEME);
    }
    setUserLocation(location) {
        return this.storage.set(Keys.USER_LOCATION, location);
    }
    getUserLocation() {
        return this.storage.get(Keys.USER_LOCATION);
    }
    setCardFastTrackEnabled(value) {
        return this.storage.set(Keys.CARD_FAST_TRACK_ENABLED, value);
    }
    getCardFastTrackEnabled() {
        return this.storage.get(Keys.CARD_FAST_TRACK_ENABLED);
    }
    setOnboardingFlowFlag(value) {
        return this.storage.set('onboardingFlowFlag', value);
    }
    getOnboardingFlowFlag() {
        return this.storage.get('onboardingFlowFlag');
    }
    setTempMdesFlag(value) {
        return this.storage.set(Keys.TEMP_MDES_DEBUG_FLAG, value);
    }
    getTempMdesFlag() {
        return this.storage.get(Keys.TEMP_MDES_DEBUG_FLAG);
    }
    setTempMdesCertOnlyFlag(value) {
        return this.storage.set(Keys.TEMP_MDES_CERT_ONLY_DEBUG_FLAG, value);
    }
    getTempMdesCertOnlyFlag() {
        return this.storage.get(Keys.TEMP_MDES_CERT_ONLY_DEBUG_FLAG);
    }
    setDynamicLink(deepLink) {
        return this.storage.set('BitPay-DynamicLink', deepLink);
    }
    getDynamicLink() {
        return this.storage.get('BitPay-DynamicLink');
    }
    removeDynamicLink() {
        return this.storage.remove('BitPay-DynamicLink');
    }
};
PersistenceProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        PlatformProvider,
        File])
], PersistenceProvider);
export { PersistenceProvider };
function getLegacyGiftCardKey(cardName, network) {
    switch (cardName + network) {
        case 'Amazon.com' + Network.livenet:
            return 'amazonGiftCards-livenet';
        case 'Amazon.com' + Network.testnet:
            return 'amazonGiftCards-testnet';
        case 'Amazon.co.jp' + Network.livenet:
            return 'amazonGiftCards-livenet-japan';
        case 'Amazon.co.jp' + Network.testnet:
            return 'amazonGiftCards-testnet-japan';
        case 'Mercado Livre' + Network.livenet:
            return 'MercadoLibreGiftCards-livenet';
        case 'Mercado Livre' + Network.testnet:
            return 'MercadoLibreGiftCards-testnet';
        default:
            return undefined;
    }
}
//# sourceMappingURL=persistence.js.map