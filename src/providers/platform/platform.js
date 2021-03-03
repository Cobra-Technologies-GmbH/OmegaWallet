import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device';
import { Platform } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';
let PlatformProvider = class PlatformProvider {
    constructor(platform, logger, device) {
        this.platform = platform;
        this.logger = logger;
        this.device = device;
        let ua = navigator ? navigator.userAgent : null;
        if (!ua) {
            this.logger.info('Could not determine navigator. Using fixed string');
            ua = 'dummy user-agent';
        }
        // Fixes IOS WebKit UA
        ua = ua.replace(/\(\d+\)$/, '');
        this.isAndroid = this.platform.is('android');
        this.isIOS = this.platform.is('ios');
        this.ua = ua;
        this.isCordova = this.platform.is('cordova');
        this.isElectron = this.isElectronPlatform();
        this.isMobile = this.platform.is('mobile');
        this.isDevel = !this.isMobile && !this.isElectron;
        this.isMac = this.isMacApp();
        this.isWindows = this.isWindowsApp();
        this.isLinux = this.isLinuxApp();
        this.logger.debug('PlatformProvider initialized');
    }
    getPlatform() {
        return this.isAndroid
            ? 'android'
            : this.isIOS
                ? 'ios'
                : this.isCordova
                    ? 'cordova'
                    : this.isMac
                        ? 'macintosh'
                        : this.isWindows
                            ? 'windows'
                            : this.isLinux
                                ? 'linux'
                                : this.isMobile
                                    ? 'mobile'
                                    : undefined;
    }
    getBrowserName() {
        let userAgent = window.navigator.userAgent;
        let browsers = {
            chrome: /chrome/i,
            safari: /safari/i,
            firefox: /firefox/i,
            ie: /internet explorer/i
        };
        for (let key in browsers) {
            if (browsers[key].test(userAgent)) {
                return key;
            }
        }
        return 'unknown';
    }
    getUserAgent() {
        return window.navigator.userAgent;
    }
    isMacApp() {
        return (this.isElectronPlatform() &&
            this.getUserAgent().toLowerCase().includes('macintosh'));
    }
    isWindowsApp() {
        return (this.isElectronPlatform() &&
            this.getUserAgent().toLowerCase().includes('windows'));
    }
    isLinuxApp() {
        return (this.isElectronPlatform() &&
            this.getUserAgent().toLowerCase().includes('linux'));
    }
    isElectronPlatform() {
        const userAgent = navigator && navigator.userAgent
            ? navigator.userAgent.toLowerCase()
            : null;
        if (userAgent && userAgent.indexOf('electron/') > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    getOS() {
        let OS = {
            OSName: '',
            extension: ''
        };
        if (this.isElectron) {
            if (navigator.appVersion.indexOf('Win') != -1) {
                OS.OSName = 'Windows';
                OS.extension = '.exe';
            }
            if (navigator.appVersion.indexOf('Mac') != -1) {
                OS.OSName = 'MacOS';
                OS.extension = '.dmg';
            }
            if (navigator.appVersion.indexOf('Linux') != -1) {
                OS.OSName = 'Linux';
                OS.extension = '-linux.zip';
            }
        }
        return OS;
    }
    getDeviceInfo() {
        let info;
        if (this.isElectron) {
            info = ' (' + navigator.appVersion + ')';
        }
        else {
            info =
                ' (' +
                    this.device.platform +
                    ' ' +
                    this.device.version +
                    ' - ' +
                    this.device.model +
                    ')';
        }
        return info;
    }
};
PlatformProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Platform,
        Logger,
        Device])
], PlatformProvider);
export { PlatformProvider };
//# sourceMappingURL=platform.js.map