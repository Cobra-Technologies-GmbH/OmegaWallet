var WalletProvider_1;
import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events } from 'ionic-angular';
import * as _ from 'lodash';
import encoding from 'text-encoding';
// Providers
import { AddressProvider } from '../address/address';
import { AppProvider } from '../app/app';
import { BwcErrorProvider } from '../bwc-error/bwc-error';
import { BwcProvider } from '../bwc/bwc';
import { ConfigProvider } from '../config/config';
import { CurrencyProvider } from '../currency/currency';
import { FeeProvider } from '../fee/fee';
import { FilterProvider } from '../filter/filter';
import { KeyProvider } from '../key/key';
import { LanguageProvider } from '../language/language';
import { Logger } from '../logger/logger';
import { LogsProvider } from '../logs/logs';
import { OnGoingProcessProvider } from '../on-going-process/on-going-process';
import { PersistenceProvider } from '../persistence/persistence';
import { PlatformProvider } from '../platform/platform';
import { PopupProvider } from '../popup/popup';
import { RateProvider } from '../rate/rate';
import { TouchIdProvider } from '../touchid/touchid';
import { TxFormatProvider } from '../tx-format/tx-format';
let WalletProvider = WalletProvider_1 = class WalletProvider {
    constructor(logger, bwcProvider, txFormatProvider, configProvider, currencyProvider, persistenceProvider, bwcErrorProvider, rateProvider, filter, popupProvider, onGoingProcessProvider, touchidProvider, events, feeProvider, translate, addressProvider, languageProvider, keyProvider, platformProvider, logsProvider, appProvider) {
        this.logger = logger;
        this.bwcProvider = bwcProvider;
        this.txFormatProvider = txFormatProvider;
        this.configProvider = configProvider;
        this.currencyProvider = currencyProvider;
        this.persistenceProvider = persistenceProvider;
        this.bwcErrorProvider = bwcErrorProvider;
        this.rateProvider = rateProvider;
        this.filter = filter;
        this.popupProvider = popupProvider;
        this.onGoingProcessProvider = onGoingProcessProvider;
        this.touchidProvider = touchidProvider;
        this.events = events;
        this.feeProvider = feeProvider;
        this.translate = translate;
        this.addressProvider = addressProvider;
        this.languageProvider = languageProvider;
        this.keyProvider = keyProvider;
        this.platformProvider = platformProvider;
        this.logsProvider = logsProvider;
        this.appProvider = appProvider;
        // Ratio low amount warning (fee/amount) in incoming TX
        this.LOW_AMOUNT_RATIO = 0.15;
        // Ratio of "many utxos" warning in total balance (fee/amount)
        this.TOTAL_LOW_WARNING_RATIO = 0.3;
        this.WALLET_STATUS_MAX_TRIES = 5;
        this.WALLET_STATUS_DELAY_BETWEEN_TRIES = 1.6 * 1000;
        this.SOFT_CONFIRMATION_LIMIT = 12;
        this.SAFE_CONFIRMATIONS = 6;
        this.DEFAULT_RBF_SEQNUMBER = 0xffffffff;
        this.errors = this.bwcProvider.getErrors();
        this.logger.debug('WalletProvider initialized');
        this.isPopupOpen = false;
    }
    invalidateCache(wallet) {
        if (wallet.cachedStatus)
            wallet.cachedStatus.isValid = false;
        if (wallet.completeHistory)
            wallet.completeHistoryIsValid = false;
        if (wallet.cachedActivity)
            wallet.cachedActivity.isValid = false;
    }
    fetchStatus(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            const walletId = wallet.id;
            const processPendingTxps = status => {
                const txps = status.pendingTxps;
                const now = Math.floor(Date.now() / 1000);
                _.each(txps, tx => {
                    tx = this.txFormatProvider.processTx(wallet.coin, tx);
                    // no future transactions...
                    if (tx.createdOn > now)
                        tx.createdOn = now;
                    tx.wallet = wallet;
                    if (!tx.wallet) {
                        this.logger.error('no wallet at txp?');
                        return;
                    }
                    const action = _.find(tx.actions, {
                        copayerId: tx.wallet.copayerId
                    });
                    if ((!action || action.type === 'failed') && tx.status == 'pending') {
                        tx.pendingForUs = true;
                    }
                    if (action && action.type == 'accept') {
                        tx.statusForUs = 'accepted';
                    }
                    else if (action && action.type == 'reject') {
                        tx.statusForUs = 'rejected';
                    }
                    else {
                        tx.statusForUs = 'pending';
                    }
                    if (!tx.deleteLockTime)
                        tx.canBeRemoved = true;
                });
                wallet.pendingTxps = txps;
            };
            const cacheBalance = (wallet, balance) => {
                if (!balance)
                    return;
                const configGet = this.configProvider.get();
                const config = configGet.wallet;
                const cache = wallet.cachedStatus;
                // Address with Balance
                cache.balanceByAddress = balance.byAddress;
                // Total wallet balance is same regardless of 'spend unconfirmed funds' setting.
                cache.totalBalanceSat = balance.totalAmount;
                // Spend unconfirmed funds
                if (config.spendUnconfirmed) {
                    cache.lockedBalanceSat = balance.lockedAmount;
                    cache.availableBalanceSat = balance.availableAmount;
                    cache.totalBytesToSendMax = balance.totalBytesToSendMax;
                    cache.pendingAmount = 0;
                    cache.spendableAmount = balance.totalAmount - balance.lockedAmount;
                }
                else {
                    cache.lockedBalanceSat = balance.lockedConfirmedAmount;
                    cache.availableBalanceSat = balance.availableConfirmedAmount;
                    cache.totalBytesToSendMax = balance.totalBytesToSendConfirmedMax;
                    cache.pendingAmount =
                        balance.totalAmount - balance.totalConfirmedAmount;
                    cache.spendableAmount =
                        balance.totalConfirmedAmount - balance.lockedAmount;
                }
                // Selected unit
                cache.unitToSatoshi = this.currencyProvider.getPrecision(wallet.coin).unitToSatoshi;
                cache.satToUnit = 1 / cache.unitToSatoshi;
                // STR
                cache.totalBalanceStr = this.txFormatProvider.formatAmountStr(wallet.coin, cache.totalBalanceSat);
                cache.lockedBalanceStr = this.txFormatProvider.formatAmountStr(wallet.coin, cache.lockedBalanceSat);
                cache.availableBalanceStr = this.txFormatProvider.formatAmountStr(wallet.coin, cache.availableBalanceSat);
                cache.spendableBalanceStr = this.txFormatProvider.formatAmountStr(wallet.coin, cache.spendableAmount);
                cache.pendingBalanceStr = this.txFormatProvider.formatAmountStr(wallet.coin, cache.pendingAmount);
                cache.alternativeName = config.settings.alternativeName;
                cache.alternativeIsoCode = config.settings.alternativeIsoCode;
                this.rateProvider
                    .whenRatesAvailable(wallet.coin)
                    .then(() => {
                    const availableBalanceAlternative = this.rateProvider.toFiat(cache.availableBalanceSat, cache.alternativeIsoCode, wallet.coin);
                    const totalBalanceAlternative = this.rateProvider.toFiat(cache.totalBalanceSat, cache.alternativeIsoCode, wallet.coin);
                    const pendingBalanceAlternative = this.rateProvider.toFiat(cache.pendingAmount, cache.alternativeIsoCode, wallet.coin);
                    const lockedBalanceAlternative = this.rateProvider.toFiat(cache.lockedBalanceSat, cache.alternativeIsoCode, wallet.coin);
                    const spendableBalanceAlternative = this.rateProvider.toFiat(cache.spendableAmount, cache.alternativeIsoCode, wallet.coin);
                    const alternativeConversionRate = this.rateProvider.toFiat(100000000, cache.alternativeIsoCode, wallet.coin);
                    cache.availableBalanceAlternative = this.filter.formatFiatAmount(availableBalanceAlternative);
                    cache.totalBalanceAlternative = this.filter.formatFiatAmount(totalBalanceAlternative);
                    cache.pendingBalanceAlternative = this.filter.formatFiatAmount(pendingBalanceAlternative);
                    cache.lockedBalanceAlternative = this.filter.formatFiatAmount(lockedBalanceAlternative);
                    cache.spendableBalanceAlternative = this.filter.formatFiatAmount(spendableBalanceAlternative);
                    cache.alternativeConversionRate = this.filter.formatFiatAmount(alternativeConversionRate);
                    cache.alternativeBalanceAvailable = true;
                    cache.isRateAvailable = true;
                })
                    .catch(err => {
                    this.logger.warn('Could not get rates: ', err);
                });
            };
            const isStatusCached = () => {
                return wallet.cachedStatus && wallet.cachedStatus.isValid;
            };
            const cacheStatus = (status) => {
                if (status.wallet && status.wallet.scanStatus == 'running')
                    return;
                wallet.cachedStatus = status || {};
                const cache = wallet.cachedStatus;
                cache.statusUpdatedOn = Date.now();
                cache.isValid = true;
                cache.email = status.preferences ? status.preferences.email : null;
                cacheBalance(wallet, status.balance);
            };
            const checkAndUpdateAdddress = () => {
                // Check address
                this.isAddressUsed(wallet, wallet.cachedStatus.balance.byAddress).then(used => {
                    const isSingleAddress = wallet.cachedStatus.wallet &&
                        wallet.cachedStatus.wallet.singleAddress;
                    if (used && !isSingleAddress) {
                        this.logger.debug('Current Wallet address used. Creating new');
                        // Force new address
                        this.getAddress(wallet, true).catch(err => {
                            this.logger.warn('Failed to create address: ', err);
                        });
                    }
                });
            };
            const hasMeet = (s1, s2) => {
                let diff = false;
                _.each(s1, (v, k) => {
                    if (s2[k] == v)
                        diff = true;
                    else
                        this.logger.debug(`Status condition not meet: ${k} is ${s2[k]} not ${v}`);
                });
                return diff;
            };
            const doFetchStatus = (tries = 0) => {
                return new Promise((resolve, reject) => {
                    if (isStatusCached() && !opts.force && !opts.until) {
                        this.logger.debug('Status cache hit for ' + wallet.id);
                        // This will update exchange rates
                        cacheStatus(wallet.cachedStatus);
                        if (this.currencyProvider.isUtxoCoin(wallet.coin)) {
                            checkAndUpdateAdddress();
                        }
                        processPendingTxps(wallet.cachedStatus);
                        return resolve(wallet.cachedStatus);
                    }
                    tries = tries || 0;
                    const { token, multisigEthInfo } = wallet.credentials;
                    wallet.getStatus({
                        tokenAddress: token ? token.address : '',
                        multisigContractAddress: multisigEthInfo
                            ? multisigEthInfo.multisigContractAddress
                            : '',
                        network: wallet.network
                    }, (err, status) => {
                        if (err) {
                            if (err instanceof this.errors.NOT_AUTHORIZED) {
                                return reject('WALLET_NOT_REGISTERED');
                            }
                            return reject(err);
                        }
                        if (opts.until) {
                            if (!hasMeet(opts.until, status.balance) &&
                                tries < this.WALLET_STATUS_MAX_TRIES) {
                                this.logger.debug('Retrying update... ' +
                                    walletId +
                                    ' Try:' +
                                    tries +
                                    ' until:', opts.until);
                                return setTimeout(() => {
                                    return resolve(doFetchStatus(++tries));
                                }, this.WALLET_STATUS_DELAY_BETWEEN_TRIES * tries);
                            }
                            else {
                                this.logger.debug('# Got Wallet Status for: ' + wallet.id + ' after meeting:', opts.until);
                            }
                        }
                        else {
                            this.logger.debug('# Got Wallet Status for: ' + wallet.id);
                        }
                        processPendingTxps(status);
                        cacheStatus(status);
                        wallet.scanning =
                            status.wallet && status.wallet.scanStatus == 'running';
                        return resolve(status);
                    });
                });
            };
            /* ========== Start =========== */
            if (opts.until && hasMeet(opts.until, wallet.cachedStatus.balance)) {
                this.logger.debug('Status change already meet: ' + wallet.credentials.walletName);
                return resolve(wallet.cachedStatus);
            }
            if (WalletProvider_1.statusUpdateOnProgress[wallet.id] && !opts.until) {
                this.logger.info('!! Status update already on progress for: ' +
                    wallet.credentials.walletName);
                return reject('INPROGRESS');
            }
            WalletProvider_1.statusUpdateOnProgress[wallet.id] = true;
            doFetchStatus()
                .then(status => {
                WalletProvider_1.statusUpdateOnProgress[wallet.id] = false;
                resolve(status);
            })
                .catch(err => {
                WalletProvider_1.statusUpdateOnProgress[wallet.id] = false;
                return reject(err);
            });
        });
    }
    getWalletTotalBalanceAlternative(balanceSat, coin, isoCode) {
        const balance = this.rateProvider.toFiat(balanceSat, isoCode, coin);
        return balance ? balance.toFixed(2) : '0.00';
    }
    getWalletTotalBalanceAlternativeLastDay(balanceSat, coin, isoCode, lastDayRatesArray) {
        const balanceLastDay = this.rateProvider.toFiat(balanceSat, isoCode, coin, {
            customRate: lastDayRatesArray[coin]
        });
        return balanceLastDay ? balanceLastDay.toFixed(2) : '0.00';
    }
    calcTotalAmount(wallet, isoCode, lastDayRatesArray) {
        const statusWallet = wallet.cachedStatus;
        let walletTotalBalanceAlternative = 0;
        let walletTotalBalanceAlternativeLastDay = 0;
        if (wallet.network === 'livenet' &&
            !wallet.hidden &&
            !_.isEmpty(statusWallet)) {
            const balance = wallet.coin === 'xrp'
                ? statusWallet.availableBalanceSat
                : statusWallet.totalBalanceSat;
            walletTotalBalanceAlternativeLastDay = parseFloat(this.getWalletTotalBalanceAlternativeLastDay(balance, wallet.coin, isoCode, lastDayRatesArray));
            walletTotalBalanceAlternative = parseFloat(this.getWalletTotalBalanceAlternative(balance, wallet.coin, isoCode));
        }
        return {
            walletTotalBalanceAlternative,
            walletTotalBalanceAlternativeLastDay
        };
    }
    getTotalAmount(wallets, lastDayRatesArray) {
        return __awaiter(this, void 0, void 0, function* () {
            const isoCode = this.configProvider.get().wallet.settings.alternativeIsoCode || 'USD';
            const totalAmountArray = [];
            _.each(wallets, wallet => {
                totalAmountArray.push(this.calcTotalAmount(wallet, isoCode, lastDayRatesArray));
            });
            const totalBalanceAlternative = _.sumBy(_.compact(totalAmountArray), b => b.walletTotalBalanceAlternative).toFixed(2);
            const totalBalanceAlternativeLastDay = _.sumBy(_.compact(totalAmountArray), b => b.walletTotalBalanceAlternativeLastDay).toFixed(2);
            const difference = parseFloat(totalBalanceAlternative.replace(/,/g, '')) -
                parseFloat(totalBalanceAlternativeLastDay.replace(/,/g, ''));
            const totalBalanceChange = (difference * 100) /
                parseFloat(totalBalanceAlternative.replace(/,/g, ''));
            return {
                totalBalanceAlternativeIsoCode: isoCode,
                totalBalanceAlternative,
                totalBalanceChange: totalBalanceChange || 0
            };
        });
    }
    // Check address
    isAddressUsed(wallet, byAddress) {
        return new Promise((resolve, reject) => {
            this.persistenceProvider
                .getLastAddress(wallet.id)
                .then(addr => {
                const used = _.find(byAddress, {
                    address: addr
                });
                return resolve(used);
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    getAddressView(coin, network, address) {
        if (coin != 'bch')
            return address;
        const protoAddr = this.getProtoAddress(coin, network, address);
        return protoAddr;
    }
    getProtoAddress(coin, network, address) {
        const proto = this.getProtocolHandler(coin, network);
        const protoAddr = proto + ':' + address;
        return protoAddr;
    }
    getAddress(wallet, forceNew) {
        return new Promise((resolve, reject) => {
            let walletId = wallet.id;
            const { token, multisigEthInfo } = wallet.credentials;
            if (multisigEthInfo && multisigEthInfo.multisigContractAddress) {
                return resolve(multisigEthInfo.multisigContractAddress);
            }
            if (token) {
                walletId = wallet.id.replace(`-${token.address}`, '');
            }
            this.persistenceProvider
                .getLastAddress(walletId)
                .then((addr) => {
                if (addr) {
                    // prevent to show legacy address
                    const isBchLegacy = wallet.coin == 'bch' && addr.match(/^[CHmn]/);
                    const isValid = this.addressProvider.isValid(addr);
                    if (!forceNew && !isBchLegacy && isValid)
                        return resolve(addr);
                }
                if (!wallet.isComplete())
                    return reject(this.bwcErrorProvider.msg('WALLET_NOT_COMPLETE'));
                if (wallet.needsBackup) {
                    return reject(this.bwcErrorProvider.msg('WALLET_NEEDS_BACKUP'));
                }
                this.createAddress(wallet)
                    .then(_addr => {
                    this.persistenceProvider
                        .storeLastAddress(walletId, _addr)
                        .then(() => {
                        return resolve(_addr);
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(err => {
                    return reject(err);
                });
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    createAddress(wallet) {
        return new Promise((resolve, reject) => {
            this.logger.info('Creating address for wallet:', wallet.id);
            wallet.createAddress({}, (err, addr) => {
                if (err) {
                    let prefix = this.translate.instant('Could not create address');
                    if (err instanceof this.errors.MAIN_ADDRESS_GAP_REACHED ||
                        (err.message && err.message == 'MAIN_ADDRESS_GAP_REACHED')) {
                        this.logger.warn(this.bwcErrorProvider.msg(err, 'Server Error'));
                        prefix = null;
                        if (!this.isPopupOpen) {
                            this.isPopupOpen = true;
                            this.popupProvider
                                .ionicAlert(null, this.bwcErrorProvider.msg('MAIN_ADDRESS_GAP_REACHED'))
                                .then(() => {
                                this.isPopupOpen = false;
                            });
                        }
                        wallet.getMainAddresses({
                            reverse: true,
                            limit: 1
                        }, (err, addr) => {
                            if (err)
                                return reject(err);
                            return resolve(addr[0].address);
                        });
                    }
                    else {
                        const msg = this.bwcErrorProvider.msg(err, prefix);
                        return reject(msg);
                    }
                }
                else if (!this.addressProvider.isValid(addr.address)) {
                    this.logger.error('Invalid address generated: ', addr.address);
                    const msg = 'INVALID_ADDRESS';
                    return reject(msg);
                }
                else {
                    return resolve(addr.address);
                }
            });
        });
    }
    getSavedTxs(walletId) {
        return new Promise((resolve, reject) => {
            this.persistenceProvider
                .getTxHistory(walletId)
                .then(txs => {
                let localTxs = [];
                if (_.isEmpty(txs)) {
                    return resolve(localTxs);
                }
                localTxs = txs;
                return resolve(_.compact(localTxs));
            })
                .catch((err) => {
                return reject(err);
            });
        });
    }
    fetchTxsFromServer(wallet, skip, endingTxid, limit) {
        return new Promise((resolve, reject) => {
            let res = [];
            const result = {
                res,
                shouldContinue: res.length >= limit
            };
            const { token, multisigEthInfo } = wallet.credentials;
            wallet.getTxHistory({
                skip,
                limit,
                tokenAddress: token ? token.address : '',
                multisigContractAddress: multisigEthInfo
                    ? multisigEthInfo.multisigContractAddress
                    : ''
            }, (err, txsFromServer) => {
                if (err)
                    return reject(err);
                if (_.isEmpty(txsFromServer))
                    return resolve(result);
                res = _.takeWhile(txsFromServer, tx => {
                    return tx.txid != endingTxid;
                });
                result.res = res;
                result.shouldContinue = res.length >= limit;
                return resolve(result);
            });
        });
    }
    updateLocalTxHistory(wallet, progressFn, opts = {}) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            const FIRST_LIMIT = 5;
            const LIMIT = 100;
            let requestLimit = FIRST_LIMIT;
            const walletId = wallet.credentials.walletId;
            WalletProvider_1.progressFn[walletId] = progressFn || (() => { });
            let foundLimitTx = [];
            const fixTxsUnit = (txs) => {
                if (!txs || !txs[0] || !txs[0].amountStr)
                    return;
                const cacheCoin = txs[0].amountStr.split(' ')[1];
                if (cacheCoin == 'bits') {
                    this.logger.debug('Fixing Tx Cache Unit to: ' + wallet.coin);
                    _.each(txs, tx => {
                        tx.amountStr = this.txFormatProvider.formatAmountStr(wallet.coin, tx.amount);
                        tx.feeStr = this.txFormatProvider.formatAmountStr(wallet.coin, tx.fees);
                    });
                }
            };
            if (WalletProvider_1.historyUpdateOnProgress[wallet.id]) {
                this.logger.debug('!! History update already on progress for: ' + wallet.id);
                if (progressFn) {
                    WalletProvider_1.progressFn[walletId] = progressFn;
                }
                return reject('HISTORY_IN_PROGRESS'); // no callback call yet.
            }
            this.logger.debug('Updating Transaction History for ' + wallet.credentials.walletName);
            WalletProvider_1.historyUpdateOnProgress[wallet.id] = true;
            this.getSavedTxs(walletId)
                .then(txsFromLocal => {
                fixTxsUnit(txsFromLocal);
                const confirmedTxs = this.removeAndMarkSoftConfirmedTx(txsFromLocal);
                const endingTxid = confirmedTxs[0] ? confirmedTxs[0].txid : null;
                const endingTs = confirmedTxs[0] ? confirmedTxs[0].time : null;
                // First update
                WalletProvider_1.progressFn[walletId](txsFromLocal, 0);
                wallet.completeHistory = txsFromLocal;
                // send update
                this.events.publish('Local/WalletHistoryUpdate', {
                    walletId: wallet.id,
                    complete: false
                });
                const getNewTxs = (newTxs, skip, tries = 0) => {
                    return new Promise((resolve, reject) => {
                        this.fetchTxsFromServer(wallet, skip, endingTxid, requestLimit)
                            .then((result) => __awaiter(this, void 0, void 0, function* () {
                            const res = result.res;
                            const shouldContinue = result.shouldContinue
                                ? result.shouldContinue
                                : false;
                            const _newTxs = yield this.processNewTxs(wallet, _.compact(res));
                            newTxs = newTxs.concat(_newTxs);
                            WalletProvider_1.progressFn[walletId](newTxs.concat(txsFromLocal), newTxs.length);
                            skip = skip + requestLimit;
                            this.logger.debug('Syncing TXs for:' +
                                walletId +
                                '. Got:' +
                                newTxs.length +
                                ' Skip:' +
                                skip, ' EndingTxid:', endingTxid, ' Continue:', shouldContinue);
                            // TODO Dirty <HACK>
                            // do not sync all history, just looking for a single TX.
                            if (opts.limitTx) {
                                foundLimitTx = _.find(newTxs.concat(txsFromLocal), {
                                    txid: opts.limitTx
                                });
                                if (!_.isEmpty(foundLimitTx)) {
                                    this.logger.debug('Found limitTX: ' + opts.limitTx);
                                    return resolve([foundLimitTx]);
                                }
                            }
                            // </HACK>
                            if (!shouldContinue) {
                                this.logger.debug('Finished Sync: New / soft confirmed Txs: ' +
                                    newTxs.length);
                                return resolve(newTxs);
                            }
                            requestLimit = LIMIT;
                            return getNewTxs(newTxs, skip).then(txs => {
                                resolve(txs);
                            });
                        }))
                            .catch(err => {
                            if (err instanceof this.errors.CONNECTION_ERROR ||
                                (err.message && err.message.match(/5../))) {
                                if (tries > 1)
                                    return reject(err);
                                return setTimeout(() => {
                                    return resolve(getNewTxs(newTxs, skip, ++tries));
                                }, 2000 + 3000 * tries);
                            }
                            else {
                                return reject(err);
                            }
                        });
                    });
                };
                getNewTxs([], 0)
                    .then(txs => {
                    const array = _.compact(txs.concat(confirmedTxs));
                    const newHistory = _.uniqBy(array, x => {
                        return x.txid;
                    });
                    const updateNotes = () => {
                        return new Promise((resolve, reject) => {
                            if (!endingTs)
                                return resolve();
                            // this.logger.debug('Syncing notes from: ' + endingTs);
                            wallet.getTxNotes({
                                minTs: endingTs
                            }, (err, notes) => {
                                if (err) {
                                    this.logger.warn('Could not get TxNotes: ', err);
                                    return reject(err);
                                }
                                _.each(notes, note => {
                                    // this.logger.debug('Note for ' + note.txid);
                                    _.each(newHistory, (tx) => {
                                        if (tx.txid == note.txid) {
                                            // this.logger.debug(
                                            //  '...updating note for ' + note.txid
                                            // );
                                            tx.note = note;
                                        }
                                    });
                                });
                                return resolve();
                            });
                        });
                    };
                    const updateLowAmount = txs => {
                        if (!opts.lowAmount)
                            return;
                        _.each(txs, tx => {
                            tx.lowAmount = tx.amount < opts.lowAmount;
                        });
                    };
                    if (this.currencyProvider.isUtxoCoin(wallet.coin)) {
                        this.getLowAmount(wallet).then(fee => {
                            opts.lowAmount = fee;
                            updateLowAmount(txs);
                        });
                    }
                    updateNotes()
                        .then(() => {
                        // <HACK>
                        if (!_.isEmpty(foundLimitTx)) {
                            this.logger.debug('Tx history read until limitTx: ' + opts.limitTx);
                            return resolve(newHistory);
                        }
                        // </HACK>
                        const historyToSave = JSON.stringify(newHistory);
                        _.each(txs, tx => {
                            tx.recent = true;
                        });
                        // Final update
                        if (walletId == wallet.credentials.walletId) {
                            wallet.completeHistory = newHistory;
                        }
                        return this.persistenceProvider
                            .setTxHistory(walletId, historyToSave)
                            .then(() => {
                            this.logger.debug('History sync & saved for ' +
                                wallet.id +
                                ' Txs: ' +
                                newHistory.length);
                            return resolve();
                        })
                            .catch(err => {
                            return reject(err);
                        });
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(err => {
                    return reject(err);
                });
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    processNewTxs(wallet, txs) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Math.floor(Date.now() / 1000);
            const txHistoryUnique = {};
            const ret = [];
            wallet.hasUnsafeConfirmed = false;
            for (let tx of txs) {
                tx = this.txFormatProvider.processTx(wallet.coin, tx);
                // no future transactions...
                if (tx.time > now)
                    tx.time = now;
                if (tx.confirmations === 0 && wallet.coin === 'btc') {
                    const coins = yield this.getCoinsForTx(wallet, tx.txid);
                    tx.isRBF = _.some(coins.inputs, input => {
                        return (input.sequenceNumber &&
                            input.sequenceNumber < this.DEFAULT_RBF_SEQNUMBER - 1);
                    });
                    tx.hasUnconfirmedInputs = _.some(coins.inputs, input => {
                        return input.mintHeight < 0;
                    });
                }
                if (tx.confirmations >= this.SAFE_CONFIRMATIONS) {
                    tx.safeConfirmed = this.SAFE_CONFIRMATIONS + '+';
                }
                else {
                    tx.safeConfirmed = false;
                    wallet.hasUnsafeConfirmed = true;
                }
                if (tx.note) {
                    delete tx.note.encryptedEditedByName;
                    delete tx.note.encryptedBody;
                }
                if (!txHistoryUnique[tx.txid]) {
                    ret.push(tx);
                    txHistoryUnique[tx.txid] = true;
                }
                else {
                    this.logger.debug('Ignoring duplicate TX in history: ' + tx.txid);
                }
            }
            return Promise.resolve(ret);
        });
    }
    removeAndMarkSoftConfirmedTx(txs) {
        return _.filter(txs, tx => {
            if (tx.confirmations >= this.SOFT_CONFIRMATION_LIMIT)
                return tx;
            tx.recent = true;
        });
    }
    // Approx utxo amount, from which the uxto is economically redeemable
    getLowAmount(wallet) {
        return new Promise((resolve, reject) => {
            this.getMinFee(wallet)
                .then(fee => {
                const minFee = fee;
                return resolve(minFee / this.LOW_AMOUNT_RATIO);
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    // Approx utxo amount, from which the uxto is economically redeemable
    getMinFee(wallet, nbOutputs) {
        return new Promise((resolve, reject) => {
            this.feeProvider
                .getFeeLevels(wallet.coin)
                .then(data => {
                const normalLevelRate = _.find(data.levels[wallet.network], level => {
                    return level.level === 'normal';
                });
                const lowLevelRate = (normalLevelRate.feePerKb / 1000).toFixed(0);
                const size = this.getEstimatedTxSize(wallet, nbOutputs);
                return resolve(size * parseInt(lowLevelRate, 10));
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    // These 2 functions were taken from
    // https://github.com/bitpay/bitcore-wallet-service/blob/master/lib/model/txproposal.js#L243
    getEstimatedSizeForSingleInput(wallet) {
        switch (wallet.credentials.addressType) {
            case 'P2PKH':
                return 147;
            default:
            case 'P2SH':
                return wallet.m * 72 + wallet.n * 36 + 44;
        }
    }
    getEstimatedTxSize(wallet, nbOutputs, nbInputs) {
        // Note: found empirically based on all multisig P2SH inputs and within m & n allowed limits.
        nbOutputs = nbOutputs ? nbOutputs : 2; // Assume 2 outputs
        const safetyMargin = 0.02;
        const overhead = 4 + 4 + 9 + 9;
        const inputSize = this.getEstimatedSizeForSingleInput(wallet);
        const outputSize = 34;
        nbInputs = nbInputs ? nbInputs : 1; // Assume 1 input
        const size = overhead + inputSize * nbInputs + outputSize * nbOutputs;
        return parseInt((size * (1 + safetyMargin)).toFixed(0), 10);
    }
    getTxNote(wallet, txid) {
        return new Promise((resolve, reject) => {
            wallet.getTxNote({
                txid
            }, (err, note) => {
                if (err)
                    return reject(err);
                return resolve(note);
            });
        });
    }
    editTxNote(wallet, args) {
        return new Promise((resolve, reject) => {
            wallet.editTxNote(args, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
    }
    getTxp(wallet, txpid) {
        return new Promise((resolve, reject) => {
            wallet.getTx(txpid, (err, txp) => {
                if (err)
                    return reject(err);
                return resolve(txp);
            });
        });
    }
    getMultisigContractInstantiationInfo(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            wallet.getMultisigContractInstantiationInfo(opts, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
    }
    getMultisigContractInfo(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            wallet.getMultisigContractInfo(opts, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
    }
    isHistoryCached(wallet) {
        return wallet.completeHistory && wallet.completeHistoryIsValid;
    }
    getTx(wallet, txid) {
        return new Promise((resolve, reject) => {
            const finish = list => {
                const tx = _.find(list, {
                    txid
                });
                if (!tx)
                    return reject('Could not get transaction');
                return tx;
            };
            if (this.isHistoryCached(wallet)) {
                const tx = finish(wallet.completeHistory);
                return resolve(tx);
            }
            else {
                const opts = {
                    limitTx: txid
                };
                this.fetchTxHistory(wallet, null, opts)
                    .then(txHistory => {
                    const tx = finish(txHistory);
                    return resolve(tx);
                })
                    .catch(err => {
                    return reject(err);
                });
            }
        });
    }
    fetchTxHistory(wallet, progressFn, opts = {}) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            if (!wallet.isComplete())
                return resolve();
            if (this.isHistoryCached(wallet) && !opts.force) {
                this.logger.debug('Returning cached history for ' + wallet.id);
                return resolve(wallet.completeHistory);
            }
            this.updateLocalTxHistory(wallet, progressFn, opts)
                .then(txs => {
                WalletProvider_1.historyUpdateOnProgress[wallet.id] = false;
                if (opts.limitTx) {
                    return resolve(txs);
                }
                wallet.completeHistoryIsValid = true;
                return resolve(wallet.completeHistory);
            })
                .catch(err => {
                if (err != 'HISTORY_IN_PROGRESS') {
                    WalletProvider_1.historyUpdateOnProgress[wallet.id] = false;
                    this.logger.warn('!! Could not update history for ', wallet.id, err);
                }
                return reject(err);
            });
        });
    }
    createTx(wallet, txp) {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(txp) || _.isEmpty(wallet))
                return reject('MISSING_PARAMETER');
            wallet.createTxProposal(txp, (err, createdTxp) => {
                if (err)
                    return reject(err);
                else {
                    this.logger.debug('Transaction created');
                    return resolve(createdTxp);
                }
            });
        });
    }
    publishTx(wallet, txp) {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(txp) || _.isEmpty(wallet))
                return reject('MISSING_PARAMETER');
            wallet.publishTxProposal({
                txp
            }, (err, publishedTx) => {
                if (err)
                    return reject(err);
                else {
                    this.logger.debug('Transaction published');
                    return resolve(publishedTx);
                }
            });
        });
    }
    signTx(wallet, txp, password) {
        return new Promise((resolve, reject) => {
            if (!wallet || !txp)
                return reject('MISSING_PARAMETER');
            const rootPath = wallet.getRootPath();
            let signatures;
            try {
                signatures = this.keyProvider.sign(wallet.credentials.keyId, rootPath, txp, password);
            }
            catch (err) {
                const title = 'Your wallet is in a corrupt state. Please contact support and share the logs provided';
                let message;
                try {
                    message = err instanceof Error ? err.toString() : JSON.stringify(err);
                }
                catch (error) {
                    message = 'Unknown error';
                }
                this.popupProvider.ionicAlert(title, message).then(() => {
                    // Share logs
                    const platform = this.platformProvider.isCordova
                        ? this.platformProvider.isAndroid
                            ? 'android'
                            : 'ios'
                        : 'desktop';
                    this.logsProvider.get(this.appProvider.info.nameCase, platform);
                });
            }
            try {
                wallet.pushSignatures(txp, signatures, (err, signedTxp) => {
                    if (err) {
                        this.logger.error('Transaction signed err: ', err);
                        return reject(err);
                    }
                    return resolve(signedTxp);
                });
            }
            catch (e) {
                this.logger.error('Error at pushSignatures:', e);
                return reject(e);
            }
        });
    }
    broadcastTx(wallet, txp) {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(txp) || _.isEmpty(wallet))
                return reject('MISSING_PARAMETER');
            if (txp.status != 'accepted')
                return reject('TX_NOT_ACCEPTED');
            wallet.broadcastTxProposal(txp, (err, broadcastedTxp, memo) => {
                if (err) {
                    if (_.isArrayBuffer(err)) {
                        const enc = new encoding.TextDecoder();
                        err = enc.decode(err);
                        this.removeTx(wallet, txp);
                        return reject(err);
                    }
                    else {
                        return reject(err);
                    }
                }
                this.logger.info('Transaction broadcasted: ', broadcastedTxp.txid);
                if (memo)
                    this.logger.info('Memo: ', memo);
                return resolve(broadcastedTxp);
            });
        });
    }
    rejectTx(wallet, txp) {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(txp) || _.isEmpty(wallet))
                return reject('MISSING_PARAMETER');
            wallet.rejectTxProposal(txp, null, (err, rejectedTxp) => {
                if (err)
                    return reject(err);
                this.logger.debug('Transaction rejected');
                return resolve(rejectedTxp);
            });
        });
    }
    removeTx(wallet, txp) {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(txp) || _.isEmpty(wallet))
                return reject('MISSING_PARAMETER');
            wallet.removeTxProposal(txp, err => {
                if (err)
                    return reject(this.bwcErrorProvider.msg(err));
                this.logger.debug('Transaction removed');
                this.invalidateCache(wallet);
                this.events.publish('Local/TxAction', {
                    walletId: wallet.id
                });
                return resolve();
            });
        });
    }
    // updates local and remote prefs for 1 wallet
    updateRemotePreferencesFor(client, prefs) {
        return new Promise((resolve, reject) => {
            client.preferences = client.preferences || {};
            if (!_.isEmpty(prefs)) {
                _.assign(client.preferences, prefs);
            }
            this.logger.debug('Saving remote preferences', client.credentials.walletName, JSON.stringify(client.preferences));
            client.savePreferences(client.preferences, err => {
                if (err) {
                    this.popupProvider.ionicAlert(this.bwcErrorProvider.msg(err, this.translate.instant('Could not save preferences on the server')));
                    return reject(err);
                }
                return resolve();
            });
        });
    }
    updateRemotePreferences(clients) {
        if (!_.isArray(clients))
            clients = [clients];
        // Set current preferences
        const config = this.configProvider.get();
        const prefs = {
            email: config.emailNotifications.email,
            language: this.languageProvider.getCurrent(),
            unit: 'btc' // deprecated
        };
        let updates = [];
        clients.forEach(c => {
            if (this.currencyProvider.isERCToken(c.credentials.coin) ||
                c.credentials.multisigEthInfo)
                return;
            updates.push(this.updateRemotePreferencesFor(c, prefs));
        });
        return Promise.all(updates);
    }
    recreate(wallet) {
        return new Promise((resolve, reject) => {
            this.logger.info('Recreating wallet:', wallet.id);
            wallet.recreateWallet(err => {
                wallet.notAuthorized = false;
                if (err)
                    return reject(err);
                return resolve();
            });
        });
    }
    startScan(wallet) {
        return new Promise((resolve, reject) => {
            this.logger.info('Scanning wallet ' + wallet.id);
            if (!wallet.isComplete())
                return reject('Wallet incomplete: ' + wallet.name);
            wallet.scanning = true;
            wallet.startScan({
                includeCopayerBranches: true
            }, err => {
                if (err)
                    return reject(err);
                return resolve();
            });
        });
    }
    clearTxHistory(wallet) {
        this.invalidateCache(wallet);
        this.persistenceProvider.removeTxHistory(wallet.id);
    }
    expireAddress(walletId) {
        return new Promise((resolve, reject) => {
            this.logger.info('Cleaning Address ' + walletId);
            this.persistenceProvider
                .clearLastAddress(walletId)
                .then(() => {
                return resolve();
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    getMainAddresses(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            opts.reverse = true;
            wallet.getMainAddresses(opts, (err, addresses) => {
                if (err)
                    return reject(err);
                return resolve(addresses);
            });
        });
    }
    getBalance(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            wallet.getBalance(opts, (err, resp) => {
                if (err)
                    return reject(err);
                return resolve(resp);
            });
        });
    }
    getLowUtxos(wallet) {
        return new Promise((resolve, reject) => {
            wallet.getUtxos({
                coin: wallet.coin
            }, (err, resp) => {
                if (err || !resp || !resp.length)
                    return reject(err ? err : 'No UTXOs');
                this.getMinFee(wallet, resp.length)
                    .then(fee => {
                    const minFee = fee;
                    const balance = _.sumBy(resp, 'satoshis');
                    // for 2 outputs
                    this.getLowAmount(wallet)
                        .then(fee => {
                        const lowAmount = fee;
                        const lowUtxos = _.filter(resp, x => {
                            return x.satoshis < lowAmount;
                        });
                        const totalLow = _.sumBy(lowUtxos, 'satoshis');
                        return resolve({
                            allUtxos: resp || [],
                            lowUtxos: lowUtxos || [],
                            totalLow,
                            warning: minFee / balance > this.TOTAL_LOW_WARNING_RATIO,
                            minFee
                        });
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(err => {
                    return reject(err);
                });
            });
        });
    }
    getUtxos(wallet) {
        return new Promise((resolve, reject) => {
            wallet.getUtxos({
                coin: wallet.coin
            }, (err, resp) => {
                if (err || !resp || !resp.length)
                    return reject(err ? err : 'No UTXOs');
                return resolve(resp);
            });
        });
    }
    getCoinsForTx(wallet, txId) {
        return new Promise((resolve, reject) => {
            wallet.getCoinsForTx({
                coin: wallet.coin,
                network: wallet.network,
                txId
            }, (err, resp) => {
                if (err)
                    return reject(err);
                return resolve(resp);
            });
        });
    }
    reject(wallet, txp) {
        return new Promise((resolve, reject) => {
            this.rejectTx(wallet, txp)
                .then(txpr => {
                this.invalidateCache(wallet);
                this.events.publish('Local/TxAction', {
                    walletId: wallet.id
                });
                return resolve(txpr);
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    onlyPublish(wallet, txp) {
        return new Promise((resolve, reject) => {
            this.publishTx(wallet, txp)
                .then(() => {
                this.invalidateCache(wallet);
                this.events.publish('Local/TxAction', {
                    walletId: wallet.id
                });
                return resolve();
            })
                .catch(err => {
                return reject(this.bwcErrorProvider.msg(err));
            });
        });
    }
    prepare(wallet) {
        return new Promise((resolve, reject) => {
            this.touchidProvider
                .checkWallet(wallet)
                .then(() => {
                this.keyProvider
                    .handleEncryptedWallet(wallet.credentials.keyId)
                    .then((password) => {
                    return resolve(password);
                })
                    .catch(err => {
                    return reject(err);
                });
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    signAndBroadcast(wallet, publishedTxp, password) {
        return new Promise((resolve, reject) => {
            this.onGoingProcessProvider.set('signingTx');
            let expected = wallet.cachedStatus.balance.totalAmount -
                publishedTxp.amount -
                publishedTxp.fee;
            this.signTx(wallet, publishedTxp, password)
                .then(signedTxp => {
                this.invalidateCache(wallet);
                if (signedTxp.status == 'accepted') {
                    this.onGoingProcessProvider.set('broadcastingTx');
                    this.broadcastTx(wallet, signedTxp)
                        .then(broadcastedTxp => {
                        this.events.publish('Local/TxAction', {
                            walletId: wallet.id,
                            until: { totalAmount: expected }
                        });
                        return resolve(broadcastedTxp);
                    })
                        .catch(err => {
                        return reject(this.bwcErrorProvider.msg(err));
                    });
                }
                else {
                    this.events.publish('Local/TxAction', {
                        walletId: wallet.id
                    });
                    return resolve(signedTxp);
                }
            })
                .catch(err => {
                const msg = err && err.message
                    ? err.message
                    : this.translate.instant('The payment was created but could not be completed. Please try again from home screen');
                this.logger.error('Sign error: ' + msg);
                this.events.publish('Local/TxAction', {
                    walletId: wallet.id,
                    until: { totalAmount: expected }
                });
                return reject(msg);
            });
        });
    }
    publishAndSign(wallet, txp) {
        return new Promise((resolve, reject) => {
            // Already published?
            if (txp.status == 'pending') {
                this.prepare(wallet)
                    .then((password) => {
                    this.signAndBroadcast(wallet, txp, password)
                        .then(broadcastedTxp => {
                        return resolve(broadcastedTxp);
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(err => {
                    return reject(err);
                });
            }
            else {
                this.prepare(wallet)
                    .then((password) => {
                    this.onGoingProcessProvider.set('sendingTx');
                    this.publishTx(wallet, txp)
                        .then(publishedTxp => {
                        this.signAndBroadcast(wallet, publishedTxp, password)
                            .then(broadcastedTxp => {
                            return resolve(broadcastedTxp);
                        })
                            .catch(err => {
                            return reject(err);
                        });
                    })
                        .catch(err => {
                        return reject(err);
                    });
                })
                    .catch(err => {
                    return reject(err);
                });
            }
        });
    }
    signMultipleTxps(wallet, txps) {
        [].concat(txps);
        const promises = [];
        return this.prepare(wallet).then((password) => __awaiter(this, void 0, void 0, function* () {
            _.each(txps, txp => {
                promises.push(this.signAndBroadcast(wallet, txp, password).catch(error => {
                    this.logger.error(error);
                    return error;
                }));
            });
            return Promise.all(promises);
        }));
    }
    getEncodedWalletInfo(wallet, password) {
        return new Promise((resolve, reject) => {
            if (!wallet.credentials.keyId) {
                return resolve();
            }
            const derivationPath = this.keyProvider.getBaseAddressDerivationPath(wallet.credentials.keyId, {
                account: wallet.account,
                coin: wallet.coin,
                n: wallet.n,
                network: wallet.network
            });
            const encodingType = {
                mnemonic: 1,
                xpriv: 2,
                xpub: 3
            };
            let info = {};
            const keys = this.getKeysWithPassword(wallet, password);
            if (!keys || (!keys.mnemonic && !keys.xPrivKey))
                return reject(this.translate.instant('Exporting via QR not supported for this wallet'));
            if (keys.mnemonic) {
                info = {
                    type: encodingType.mnemonic,
                    data: keys.mnemonic
                };
            }
            else {
                info = {
                    type: encodingType.xpriv,
                    data: keys.xPrivKey
                };
            }
            const mnemonicHasPassphrase = this.keyProvider.mnemonicHasPassphrase(wallet.credentials.keyId);
            return resolve(info.type +
                '|' +
                info.data +
                '|' +
                wallet.credentials.network.toLowerCase() +
                '|' +
                derivationPath +
                '|' +
                mnemonicHasPassphrase +
                '|' +
                wallet.coin);
        });
    }
    getKeysWithPassword(wallet, password) {
        try {
            return this.keyProvider.get(wallet.credentials.keyId, password);
        }
        catch (e) {
            this.logger.error(e);
        }
    }
    setTouchId(walletsArray, enabled) {
        const opts = {
            touchIdFor: {}
        };
        walletsArray.forEach(wallet => {
            opts.touchIdFor[wallet.id] = enabled;
        });
        const promise = this.touchidProvider.checkWallet(walletsArray[0]);
        return promise.then(() => {
            this.configProvider.set(opts);
            return Promise.resolve();
        });
    }
    getKeys(wallet) {
        return new Promise((resolve, reject) => {
            this.prepare(wallet)
                .then((password) => {
                let keys;
                try {
                    keys = this.getKeysWithPassword(wallet, password);
                }
                catch (e) {
                    return reject(e);
                }
                return resolve(keys);
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    getMnemonicAndPassword(wallet) {
        return new Promise((resolve, reject) => {
            this.prepare(wallet)
                .then((password) => {
                let keys;
                try {
                    keys = this.getKeysWithPassword(wallet, password);
                }
                catch (e) {
                    return reject(e);
                }
                const mnemonic = keys.mnemonic;
                return resolve({ mnemonic, password });
            })
                .catch(err => {
                return reject(err);
            });
        });
    }
    getSendMaxInfo(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            wallet.getSendMaxInfo(opts, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
    }
    getEstimateGas(wallet, opts) {
        return new Promise((resolve, reject) => {
            opts = opts || {};
            wallet.getEstimateGas(opts, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
    }
    getProtocolHandler(coin, network = 'livenet') {
        return this.currencyProvider.getProtocolPrefix(coin, network);
    }
    copyCopayers(wallet, newWallet) {
        return new Promise((resolve, reject) => {
            let walletPrivKey = this.bwcProvider
                .getBitcore()
                .PrivateKey.fromString(wallet.credentials.walletPrivKey);
            let copayer = 1;
            let i = 0;
            _.each(wallet.credentials.publicKeyRing, item => {
                let name = item.copayerName || 'copayer ' + copayer++;
                newWallet._doJoinWallet(newWallet.credentials.walletId, walletPrivKey, item.xPubKey, item.requestPubKey, name, {
                    coin: newWallet.credentials.coin
                }, (err) => {
                    // Ignore error is copayer already in wallet
                    if (err && !(err instanceof this.errors.COPAYER_IN_WALLET))
                        return reject(err);
                    if (++i == wallet.credentials.publicKeyRing.length)
                        return resolve();
                });
            });
        });
    }
};
WalletProvider.progressFn = {};
WalletProvider.statusUpdateOnProgress = {};
WalletProvider.historyUpdateOnProgress = {};
WalletProvider = WalletProvider_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        BwcProvider,
        TxFormatProvider,
        ConfigProvider,
        CurrencyProvider,
        PersistenceProvider,
        BwcErrorProvider,
        RateProvider,
        FilterProvider,
        PopupProvider,
        OnGoingProcessProvider,
        TouchIdProvider,
        Events,
        FeeProvider,
        TranslateService,
        AddressProvider,
        LanguageProvider,
        KeyProvider,
        PlatformProvider,
        LogsProvider,
        AppProvider])
], WalletProvider);
export { WalletProvider };
//# sourceMappingURL=wallet.js.map