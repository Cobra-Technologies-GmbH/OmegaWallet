import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
// providers
import { ConfigProvider } from '../config/config';
import { Logger } from '../logger/logger';
import { PlatformProvider } from '../platform/platform';
let ThemeProvider = class ThemeProvider {
    constructor(logger, statusBar, platformProvider, translate, configProvider) {
        this.logger = logger;
        this.statusBar = statusBar;
        this.platformProvider = platformProvider;
        this.translate = translate;
        this.configProvider = configProvider;
        this.useSystemTheme = false;
        this.logger.debug('ThemeProvider initialized');
        this.availableThemes = {
            light: {
                name: this.translate.instant('Light Mode'),
                bodyColor: 'initial',
                backgroundColor: '#ffffff',
                fixedScrollBgColor: '#f8f8f9',
                walletDetailsBackgroundStart: '#ffffff',
                walletDetailsBackgroundEnd: '#ffffff'
            },
            dark: {
                name: this.translate.instant('Dark Mode'),
                bodyColor: '#121212',
                backgroundColor: '#121212',
                fixedScrollBgColor: '#121212',
                walletDetailsBackgroundStart: '#121212',
                walletDetailsBackgroundEnd: '#101010'
            }
        };
    }
    isEnabled() {
        const config = this.configProvider.get();
        return !!config.theme.enabled;
    }
    load() {
        return new Promise(resolve => {
            if (!this.isEnabled())
                return resolve();
            const config = this.configProvider.get();
            if (!config.theme.system) {
                this.useSystemTheme = false;
                this.currentAppTheme = config.theme.name;
                this.logger.debug('Set Stored App Theme: ' + this.currentAppTheme);
                return resolve();
            }
            else {
                // Auto-detect theme
                this.useSystemTheme = true;
                this.getDetectedSystemTheme().then(theme => {
                    this.currentAppTheme = theme;
                    this.logger.debug('Set System App Theme to: ' + this.currentAppTheme);
                    return resolve();
                });
            }
        });
    }
    getDetectedSystemTheme() {
        return new Promise(resolve => {
            if (this.platformProvider.isCordova) {
                cordova.plugins.ThemeDetection.isAvailable(res => {
                    if (res && res.value) {
                        cordova.plugins.ThemeDetection.isDarkModeEnabled(success => {
                            return resolve(success && success.value ? 'dark' : 'light');
                        }, _ => {
                            return resolve('light');
                        });
                    }
                    else {
                        return resolve('light');
                    }
                }, _ => {
                    return resolve('light');
                });
            }
            else {
                return resolve(window.matchMedia &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light');
            }
        });
    }
    apply() {
        if (!this.isEnabled())
            return;
        const isDarkMode = this.isDarkModeEnabled();
        if (this.platformProvider.isCordova) {
            setTimeout(() => {
                if (isDarkMode) {
                    this.useDarkStatusBar();
                }
                else {
                    this.useLightStatusBar();
                }
            }, 100);
        }
        // Force body background
        document.body.style.backgroundColor = this.availableThemes[this.currentAppTheme].bodyColor;
        document
            .getElementsByTagName('ion-app')[0]
            .classList.remove('dark', 'light');
        document
            .getElementsByTagName('ion-app')[0]
            .classList.add(isDarkMode ? 'dark' : 'light');
        this.logger.debug('Apply Theme: ' + this.currentAppTheme);
    }
    setActiveTheme(theme, detectedSystemTheme) {
        switch (theme) {
            case 'system':
                this.useSystemTheme = true;
                this.currentAppTheme = detectedSystemTheme;
                break;
            default:
                this.useSystemTheme = false;
                this.currentAppTheme = theme || detectedSystemTheme;
        }
        this.setConfigTheme();
        this.apply();
    }
    setConfigTheme() {
        let opts = {
            theme: {
                enabled: true,
                name: this.currentAppTheme,
                system: this.useSystemTheme
            }
        };
        this.configProvider.set(opts);
    }
    getThemeInfo(theme) {
        // If no theme provided returns current theme info
        if (theme && this.availableThemes[theme])
            return this.availableThemes[theme];
        else if (this.availableThemes[this.currentAppTheme])
            return this.availableThemes[this.currentAppTheme];
        else
            return this.availableThemes['light'];
    }
    isDarkModeEnabled() {
        return Boolean(this.currentAppTheme === 'dark');
    }
    getCurrentAppTheme() {
        if (!this.isEnabled())
            return;
        return this.useSystemTheme
            ? 'System Default'
            : this.availableThemes[this.currentAppTheme].name;
    }
    getSelectedTheme() {
        return this.useSystemTheme ? 'system' : this.currentAppTheme;
    }
    useDarkStatusBar() {
        this.statusBar.backgroundColorByHexString(this.availableThemes['dark'].backgroundColor);
        this.statusBar.styleBlackOpaque();
    }
    useLightStatusBar() {
        this.statusBar.backgroundColorByHexString(this.availableThemes['light'].backgroundColor);
        this.statusBar.styleDefault();
    }
    useCustomStatusBar(color) {
        this.statusBar.backgroundColorByHexString(color);
        this.statusBar.styleBlackOpaque();
    }
    useDefaultStatusBar() {
        if (this.isDarkModeEnabled()) {
            this.useDarkStatusBar();
        }
        else {
            this.useLightStatusBar();
        }
    }
};
ThemeProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        StatusBar,
        PlatformProvider,
        TranslateService,
        ConfigProvider])
], ThemeProvider);
export { ThemeProvider };
//# sourceMappingURL=theme.js.map