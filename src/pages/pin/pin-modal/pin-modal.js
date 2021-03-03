import { __decorate, __metadata } from "tslib";
import { Component, ViewChild } from '@angular/core';
import { Vibration } from '@ionic-native/vibration';
import { NavParams, Platform, ViewController } from 'ionic-angular';
import { Animate } from '../../../directives/animate/animate';
import { ConfigProvider } from '../../../providers/config/config';
import { Logger } from '../../../providers/logger/logger';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
import { PlatformProvider } from '../../../providers/platform/platform';
let PinModalPage = class PinModalPage {
    constructor(configProvider, logger, platform, navParams, persistenceProvider, vibration, viewCtrl, platformProvider) {
        this.configProvider = configProvider;
        this.logger = logger;
        this.platform = platform;
        this.navParams = navParams;
        this.persistenceProvider = persistenceProvider;
        this.vibration = vibration;
        this.viewCtrl = viewCtrl;
        this.platformProvider = platformProvider;
        this.ATTEMPT_LIMIT = 3;
        this.ATTEMPT_LOCK_OUT_TIME = 2 * 60;
        this.currentAttempts = 0;
        this.currentPin = '';
        this.firstPinEntered = '';
        this.confirmingPin = false;
        this.action = '';
        this.disableButtons = false;
        this.expires = '';
        this.incorrect = false;
        this.unregister = this.platform.registerBackButtonAction(() => { });
        this.action = this.navParams.get('action');
        this.isCordova = this.platformProvider.isCordova;
        if (this.action === 'checkPin' || this.action === 'lockSetUp') {
            this.checkIfLocked();
        }
    }
    ionViewWillEnter() {
        this.onPauseSubscription = this.platform.pause.subscribe(() => {
            this.lockReleaseTimeout.unref();
            this.countDown.unref();
            this.currentPin = this.firstPinEntered = '';
        });
        this.onResumeSubscription = this.platform.resume.subscribe(() => {
            this.disableButtons = true;
            setTimeout(() => {
                this.checkIfLocked();
            }, 1000);
        });
    }
    ionViewWillLeave() {
        this.onPauseSubscription.unsubscribe();
        this.onResumeSubscription.unsubscribe();
    }
    checkIfLocked() {
        this.persistenceProvider.getLockStatus().then((isLocked) => {
            if (!isLocked) {
                this.disableButtons = false;
                return;
            }
            if (this.action === 'checkPin') {
                this.showLockTimer();
                this.setLockRelease();
            }
        });
    }
    close(cancelClicked) {
        if (this.countDown) {
            clearInterval(this.countDown);
        }
        this.unregister();
        this.viewCtrl.dismiss(cancelClicked);
    }
    newEntry(value) {
        if (this.disableButtons)
            return;
        if (value === 'delete') {
            return this.delete();
        }
        this.incorrect = false;
        this.currentPin = this.currentPin + value;
        if (!this.isComplete())
            return;
        if (this.action === 'checkPin' || this.action === 'lockSetUp') {
            setTimeout(() => {
                this.checkIfCorrect();
            }, 100);
        }
        if (this.action === 'pinSetUp') {
            setTimeout(() => {
                if (!this.confirmingPin) {
                    this.confirmingPin = true;
                    this.firstPinEntered = this.currentPin;
                    this.currentPin = '';
                }
                else if (this.firstPinEntered === this.currentPin)
                    this.save();
                else {
                    this.firstPinEntered = this.currentPin = '';
                    this.incorrect = true;
                    this.confirmingPin = false;
                    this.shakeCode();
                }
            }, 100);
        }
    }
    checkAttempts() {
        this.currentAttempts += 1;
        this.logger.info('Attempts to unlock:', this.currentAttempts);
        this.incorrect = true;
        if (this.currentAttempts == this.ATTEMPT_LIMIT &&
            this.action !== 'lockSetUp') {
            this.countDown = this.lockReleaseTimeout = null;
            this.currentAttempts = 0;
            this.persistenceProvider.setLockStatus('locked');
            this.showLockTimer();
            this.setLockRelease();
        }
        else {
            this.disableButtons = null;
        }
    }
    showLockTimer() {
        this.disableButtons = true;
        if (this.countDown) {
            this.incorrect = false;
            this.countDown.ref();
            return;
        }
        const bannedUntil = Math.floor(Date.now() / 1000) + this.ATTEMPT_LOCK_OUT_TIME;
        this.countDown = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const totalSecs = bannedUntil - now;
            // totalSecs should never be negative
            if (totalSecs < 0) {
                this.resetClock();
                return;
            }
            const m = Math.floor(totalSecs / 60);
            const s = totalSecs % 60;
            this.expires = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
        }, 1000);
    }
    setLockRelease() {
        if (this.lockReleaseTimeout) {
            this.lockReleaseTimeout.ref();
            return;
        }
        this.lockReleaseTimeout = setTimeout(() => {
            this.resetClock();
        }, this.ATTEMPT_LOCK_OUT_TIME * 1000);
    }
    resetClock() {
        clearInterval(this.countDown);
        this.expires = this.disableButtons = null;
        this.currentPin = this.firstPinEntered = '';
        this.incorrect = false;
        this.persistenceProvider.removeLockStatus();
    }
    delete() {
        if (this.disableButtons)
            return;
        this.currentPin = this.currentPin.substring(0, this.currentPin.length - 1);
    }
    isComplete() {
        if (this.currentPin.length < 4)
            return false;
        if (this.action != 'pinSetUp')
            this.disableButtons = true;
        return true;
    }
    save() {
        const lock = { method: 'pin', value: this.currentPin, bannedUntil: null };
        this.configProvider.set({ lock });
        this.close();
    }
    checkIfCorrect() {
        const config = this.configProvider.get();
        const pinValue = config.lock && config.lock.value;
        if (pinValue == this.currentPin) {
            if (this.action === 'checkPin' || this.action === 'lockSetUp') {
                this.close();
            }
        }
        else {
            this.currentPin = '';
            this.checkAttempts();
            this.shakeCode();
        }
    }
    shakeCode() {
        this.pinCode.animate('shake');
        this.vibration.vibrate(100);
    }
};
__decorate([
    ViewChild(Animate),
    __metadata("design:type", Animate)
], PinModalPage.prototype, "pinCode", void 0);
PinModalPage = __decorate([
    Component({
        selector: 'page-pin',
        templateUrl: 'pin-modal.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        Logger,
        Platform,
        NavParams,
        PersistenceProvider,
        Vibration,
        ViewController,
        PlatformProvider])
], PinModalPage);
export { PinModalPage };
//# sourceMappingURL=pin-modal.js.map