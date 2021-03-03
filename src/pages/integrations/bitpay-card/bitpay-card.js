import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';
// Pages
import { AmountPage } from '../../send/amount/amount';
// providers
import { BitPayCardProvider } from '../../../providers/bitpay-card/bitpay-card';
import { BitPayProvider } from '../../../providers/bitpay/bitpay';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { PlatformProvider } from '../../../providers/platform/platform';
import { PopupProvider } from '../../../providers/popup/popup';
import { ThemeProvider } from '../../../providers/theme/theme';
import { TimeProvider } from '../../../providers/time/time';
import * as _ from 'lodash';
import * as moment from 'moment';
const TIMEOUT_FOR_REFRESHER = 1000;
let BitPayCardPage = class BitPayCardPage {
    constructor(translate, bitPayProvider, bitPayCardProvider, logger, popupProvider, timeProvider, externalLinkProvider, navParams, navCtrl, platformProvider, themeProvider) {
        this.translate = translate;
        this.bitPayProvider = bitPayProvider;
        this.bitPayCardProvider = bitPayCardProvider;
        this.logger = logger;
        this.popupProvider = popupProvider;
        this.timeProvider = timeProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.navParams = navParams;
        this.navCtrl = navCtrl;
        this.platformProvider = platformProvider;
        this.themeProvider = themeProvider;
        this.okText = this.translate.instant('Ok');
        this.cancelText = this.translate.instant('Cancel');
        this.dateRange = {
            value: 'last30Days'
        };
        this.network = this.bitPayProvider.getEnvironment().network;
        this.cardId = this.navParams.data.id;
        if (!this.cardId)
            this.navCtrl.pop();
        this.bitPayCardProvider
            .get({
            cardId: this.cardId
        })
            .then(cards => {
            if (cards && cards[0]) {
                this.lastFourDigits = cards[0].lastFourDigits;
                this.balance = cards[0].balance;
                this.updatedOn = cards[0].updatedOn;
                this.currency = cards[0].currency;
                this.setDateTime(cards[0].history);
                this.setHistory(cards[0].history);
            }
            this.update();
        });
    }
    ionViewWillEnter() {
        this.backgroundColor = this.themeProvider.isDarkModeEnabled()
            ? this.themeProvider.getThemeInfo().walletDetailsBackgroundStart
            : '#0c204e';
        if (this.platformProvider.isCordova) {
            this.themeProvider.useCustomStatusBar('#0c204e');
        }
    }
    ionViewDidEnter() {
        this.bitPayCardProvider.logEvent('legacycard_view', {});
    }
    ionViewWillLeave() {
        if (this.platformProvider.isCordova) {
            this.themeProvider.useDefaultStatusBar();
        }
    }
    logLegacyCardTopupStartEvent() {
        this.bitPayCardProvider.logEvent('legacycard_topup_start', {});
    }
    logLegacyCardViewAmountItem() {
        this.bitPayCardProvider.logEvent('view_item', {
            items: [
                {
                    name: 'legacyCard',
                    category: 'debitCard'
                }
            ]
        });
    }
    setDateRange(preset) {
        let startDate;
        let endDate;
        preset = preset || 'last30Days';
        switch (preset) {
            case 'last30Days':
                startDate = moment().subtract(30, 'days').toISOString();
                endDate = moment().toISOString();
                break;
            case 'lastMonth':
                startDate = moment()
                    .startOf('month')
                    .subtract(1, 'month')
                    .toISOString();
                endDate = moment().startOf('month').toISOString();
                break;
            case 'all':
                startDate = null;
                endDate = null;
                break;
            default:
                return undefined;
        }
        return {
            startDate,
            endDate
        };
    }
    setGetStarted(history, cb) {
        // Is the card new?
        if (!_.isEmpty(history.transactionList))
            return cb();
        let dateRange = this.setDateRange('all');
        this.bitPayCardProvider.updateHistory(this.cardId, dateRange, (err, history) => {
            if (!err && _.isEmpty(history.transactionList))
                this.getStarted = true;
            return cb();
        });
    }
    update() {
        let dateRange = this.setDateRange(this.dateRange.value);
        this.loadingHistory = true;
        this.bitPayCardProvider.updateHistory(this.cardId, dateRange, (err, history) => {
            this.loadingHistory = false;
            if (err) {
                this.logger.error(err);
                this.bitpayCardTransactionHistoryCompleted = null;
                this.bitpayCardTransactionHistoryConfirming = null;
                this.bitpayCardTransactionHistoryPreAuth = null;
                this.balance = null;
                this.popupProvider
                    .ionicAlert(err, this.translate.instant('Could not get transactions'))
                    .then(() => {
                    this.navCtrl.pop();
                });
                return;
            }
            this.setGetStarted(history, () => {
                let txs = _.clone(history.txs);
                this.setDateTime(txs);
                this.setHistory(txs);
                this.balance = history.currentCardBalance;
                this.updatedOn = null;
                if (this.dateRange.value == 'last30Days') {
                    // TODO?
                    // $log.debug('Omega Card: storing cache history');
                    // let cacheHistory = {
                    //   balance: history.currentCardBalance,
                    //   transactions: history.txs
                    // };
                    // this.bitPayCardProvider.setHistory($scope.cardId, cacheHistory, {}, (err) => {
                    //   if (err) $log.error(err);
                    //   $scope.historyCached = true;
                    // });
                }
            });
        });
    }
    setHistory(txs) {
        if (!txs)
            return;
        this.bitpayCardTransactionHistoryConfirming = this.bitPayCardProvider.filterTransactions('confirming', txs);
        this.bitpayCardTransactionHistoryCompleted = this.bitPayCardProvider.filterTransactions('completed', txs);
        this.bitpayCardTransactionHistoryPreAuth = this.bitPayCardProvider.filterTransactions('preAuth', txs);
    }
    setDateTime(txs) {
        if (!txs)
            return;
        let txDate, txDateUtc;
        let newDate;
        for (let i = 0; i < txs.length; i++) {
            txDate = new Date(txs[i].date);
            if (txDate == 'Invalid Date')
                return; // iOS
            txDateUtc = new Date(txs[i].date.replace('Z', ''));
            let amTime = this.createdWithinPastDay(txs[i]);
            newDate = amTime
                ? moment(txDateUtc).fromNow()
                : moment(txDate).utc().format('MMM D, YYYY');
            txs[i].date = newDate;
        }
    }
    createdWithinPastDay(tx) {
        let result = false;
        if (tx.date) {
            result = this.timeProvider.withinPastDay(tx.date);
        }
        return result;
    }
    openExternalLink(url) {
        let optIn = true;
        let title = null;
        let message = this.translate.instant('Help and support information is available at the website.');
        let okText = this.translate.instant('Open');
        let cancelText = this.translate.instant('Go Back');
        this.externalLinkProvider.open(url, optIn, title, message, okText, cancelText);
    }
    topUp() {
        this.logLegacyCardTopupStartEvent();
        this.navCtrl.push(AmountPage, {
            id: this.cardId,
            nextPage: 'BitPayCardTopUpPage',
            currency: this.currency
        });
    }
    doRefresh(refresher) {
        this.update();
        setTimeout(() => {
            refresher.complete();
        }, TIMEOUT_FOR_REFRESHER);
    }
};
BitPayCardPage = __decorate([
    Component({
        selector: 'page-bitpay-card',
        templateUrl: 'bitpay-card.html'
    }),
    __metadata("design:paramtypes", [TranslateService,
        BitPayProvider,
        BitPayCardProvider,
        Logger,
        PopupProvider,
        TimeProvider,
        ExternalLinkProvider,
        NavParams,
        NavController,
        PlatformProvider,
        ThemeProvider])
], BitPayCardPage);
export { BitPayCardPage };
//# sourceMappingURL=bitpay-card.js.map