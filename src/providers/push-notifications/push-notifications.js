import { __awaiter, __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FCMNG } from 'fcm-ng';
import { Events, ToastController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { Logger } from '../../providers/logger/logger';
// providers
import { AppProvider } from '../app/app';
import { BwcProvider } from '../bwc/bwc';
import { ConfigProvider } from '../config/config';
import { PlatformProvider } from '../platform/platform';
import { ProfileProvider } from '../profile/profile';
import BWC from 'bitcore-wallet-client';
import * as _ from 'lodash';
let PushNotificationsProvider = class PushNotificationsProvider {
    constructor(http, profileProvider, platformProvider, configProvider, logger, appProvider, bwcProvider, FCMPlugin, events, toastCtrl, translate) {
        this.http = http;
        this.profileProvider = profileProvider;
        this.platformProvider = platformProvider;
        this.configProvider = configProvider;
        this.logger = logger;
        this.appProvider = appProvider;
        this.bwcProvider = bwcProvider;
        this.FCMPlugin = FCMPlugin;
        this.events = events;
        this.toastCtrl = toastCtrl;
        this.translate = translate;
        this._token = null;
        this.toasts = [];
        this.logger.debug('PushNotificationsProvider initialized');
        this.isIOS = this.platformProvider.isIOS;
        this.isAndroid = this.platformProvider.isAndroid;
        this.usePushNotifications = this.platformProvider.isCordova;
    }
    init() {
        if (!this.usePushNotifications || this._token)
            return;
        this.configProvider.load().then(() => {
            const config = this.configProvider.get();
            if (!config.pushNotifications.enabled)
                return;
            this.logger.debug('Starting push notification registration...');
            // Keep in mind the function will return null if the token has not been established yet.
            this.FCMPlugin.getToken().then(token => {
                if (!token) {
                    setTimeout(() => {
                        this.init();
                    }, 5000);
                    return;
                }
                this.logger.debug('Get token for push notifications: ' + token);
                this._token = token;
                this.enable();
                this.handlePushNotifications();
                // enabling topics
                if (this.appProvider.info.name != 'copay' &&
                    config.offersAndPromotions.enabled)
                    this.subscribeToTopic('offersandpromotions');
                if (this.appProvider.info.name != 'copay' &&
                    config.productsUpdates.enabled)
                    this.subscribeToTopic('productsupdates');
                this.fcmInterval = setInterval(() => {
                    this.renewSubscription();
                }, 5 * 60 * 1000); // 5 min
            });
        });
    }
    renewSubscription() {
        const opts = {
            showHidden: false
        };
        const wallets = this.profileProvider.getWallets(opts);
        _.forEach(wallets, walletClient => {
            this._unsubscribe(walletClient);
        });
        setTimeout(() => {
            this.updateSubscription(wallets);
        }, 1000);
    }
    handlePushNotifications() {
        if (this.usePushNotifications) {
            this.FCMPlugin.onNotification().subscribe((data) => __awaiter(this, void 0, void 0, function* () {
                if (!this._token)
                    return;
                this.logger.debug('New Event Push onNotification: ' + JSON.stringify(data));
                if (data.wasTapped) {
                    // Notification was received on device tray and tapped by the user.
                    if (data.redir) {
                        this.events.publish('IncomingDataRedir', { name: data.redir });
                    }
                    else if (data.takeover_url &&
                        data.takeover_image &&
                        data.takeover_sig) {
                        if (!this.verifySignature(data))
                            return;
                        this.events.publish('ShowAdvertising', data);
                    }
                    else {
                        this._openWallet(data);
                    }
                }
                else {
                    const wallet = this.findWallet(data.walletId, data.tokenAddress);
                    if (!wallet)
                        return;
                    this.newBwsEvent(data, wallet.credentials.walletId);
                    this.showToastNotification(data);
                }
            }));
        }
    }
    newBwsEvent(notification, walletId) {
        let id = walletId;
        if (notification.tokenAddress) {
            id = walletId + '-' + notification.tokenAddress.toLowerCase();
            this.logger.debug(`event for token wallet: ${id}`);
        }
        this.events.publish('bwsEvent', id, notification.notification_type, notification);
    }
    updateSubscription(walletClient) {
        if (!this._token) {
            this.logger.warn('Push notifications disabled for this device. Nothing to do here.');
            return;
        }
        if (!_.isArray(walletClient))
            walletClient = [walletClient];
        walletClient.forEach(w => {
            this._subscribe(w);
        });
    }
    enable() {
        if (!this._token) {
            this.logger.warn('No token available for this device. Cannot set push notifications. Needs registration.');
            return;
        }
        const opts = {
            showHidden: false
        };
        const wallets = this.profileProvider.getWallets(opts);
        _.forEach(wallets, walletClient => {
            this._subscribe(walletClient);
        });
    }
    disable() {
        if (!this._token) {
            this.logger.warn('No token available for this device. Cannot disable push notifications.');
            return;
        }
        // disabling topics
        this.unsubscribeFromTopic('offersandpromotions');
        this.unsubscribeFromTopic('productsupdates');
        const opts = {
            showHidden: true
        };
        const wallets = this.profileProvider.getWallets(opts);
        _.forEach(wallets, walletClient => {
            this._unsubscribe(walletClient);
        });
        this._token = null;
        clearInterval(this.fcmInterval);
    }
    unsubscribe(walletClient) {
        if (!this._token)
            return;
        this._unsubscribe(walletClient);
    }
    subscribeToTopic(topic) {
        this.FCMPlugin.subscribeToTopic(topic);
    }
    unsubscribeFromTopic(topic) {
        this.FCMPlugin.unsubscribeFromTopic(topic);
    }
    _subscribe(walletClient) {
        const opts = {
            token: this._token,
            platform: this.isIOS ? 'ios' : this.isAndroid ? 'android' : null,
            packageName: this.appProvider.info.packageNameId,
            walletId: walletClient.credentials.walletId
        };
        walletClient.pushNotificationsSubscribe(opts, err => {
            if (err)
                this.logger.error(walletClient.name + ': Subscription Push Notifications error. ', err.message);
            else
                this.logger.debug(walletClient.name + ': Subscription Push Notifications success.');
        });
    }
    _unsubscribe(walletClient) {
        walletClient.pushNotificationsUnsubscribe(this._token, err => {
            if (err)
                this.logger.error(walletClient.name + ': Unsubscription Push Notifications error. ', err.message);
            else
                this.logger.debug(walletClient.name + ': Unsubscription Push Notifications Success.');
        });
    }
    _openWallet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletIdHashed = data.walletId;
            const tokenAddress = data.tokenAddress;
            const multisigContractAddress = data.multisigContractAddress;
            if (!walletIdHashed)
                return;
            const wallet = this.findWallet(walletIdHashed, tokenAddress, multisigContractAddress);
            if (!wallet || this.openWalletId === wallet.credentials.walletId)
                return;
            this.openWalletId = wallet.credentials.walletId; // avoid opening the same wallet many times
            yield Observable.timer(1000).toPromise(); // wait for subscription to OpenWallet event
            this.events.publish('OpenWallet', wallet);
        });
    }
    findWallet(walletIdHashed, tokenAddress, multisigContractAddress) {
        let walletIdHash;
        const sjcl = this.bwcProvider.getSJCL();
        const wallets = this.profileProvider.getWallets();
        const wallet = _.find(wallets, w => {
            if (tokenAddress || multisigContractAddress) {
                const walletId = w.credentials.walletId;
                const lastHyphenPosition = walletId.lastIndexOf('-');
                const walletIdWithoutTokenAddress = walletId.substring(0, lastHyphenPosition);
                walletIdHash = sjcl.hash.sha256.hash(walletIdWithoutTokenAddress);
            }
            else {
                walletIdHash = sjcl.hash.sha256.hash(w.credentials.walletId);
            }
            return _.isEqual(walletIdHashed, sjcl.codec.hex.fromBits(walletIdHash));
        });
        return wallet;
    }
    clearAllNotifications() {
        if (!this._token)
            return;
        this.FCMPlugin.clearAllNotifications();
    }
    verifySignature(data) {
        const pubKey = this.appProvider.info.marketingPublicKey;
        if (!pubKey)
            return false;
        const b = BWC.Bitcore;
        const ECDSA = b.crypto.ECDSA;
        const Hash = b.crypto.Hash;
        const SEP = '::';
        const _takeover_url = data.takeover_url;
        const _takeover_image = data.takeover_image;
        const _takeover_sig = data.takeover_sig;
        const sigObj = b.crypto.Signature.fromString(_takeover_sig);
        const _hashbuf = Hash.sha256(Buffer.from(_takeover_url + SEP + _takeover_image));
        const verificationResult = ECDSA.verify(_hashbuf, sigObj, new b.PublicKey(pubKey), 'little');
        return verificationResult;
    }
    showToastNotification(data) {
        if (!data.body || data.notification_type === 'NewOutgoingTx')
            return;
        this.toasts.unshift(data);
        this.runToastQueue();
    }
    runToastQueue() {
        if (this.currentToast)
            return;
        this.toasts.some(data => {
            if (!data.showDone) {
                this.currentToast = this.toastCtrl.create({
                    message: `${data.title}\n${data.body}`,
                    duration: 5000,
                    position: 'top',
                    showCloseButton: true,
                    closeButtonText: this.translate.instant('Open Wallet'),
                    cssClass: 'toast-bg'
                });
                this.currentToast.onDidDismiss((_opt, role) => {
                    if (role === 'close')
                        this._openWallet(data);
                    this.currentToast = null;
                    this.runToastQueue();
                });
                this.currentToast.present();
                data.showDone = true;
                return true;
            }
            return false;
        });
    }
};
PushNotificationsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        ProfileProvider,
        PlatformProvider,
        ConfigProvider,
        Logger,
        AppProvider,
        BwcProvider,
        FCMNG,
        Events,
        ToastController,
        TranslateService])
], PushNotificationsProvider);
export { PushNotificationsProvider };
//# sourceMappingURL=push-notifications.js.map