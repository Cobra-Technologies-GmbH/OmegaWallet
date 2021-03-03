import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
// providers
import { IABCardProvider, Logger, PlatformProvider, ThemeProvider } from '../../../providers';
let LocalThemePage = class LocalThemePage {
    constructor(logger, themeProvider, iabCardProvider, platformProvider) {
        this.logger = logger;
        this.themeProvider = themeProvider;
        this.iabCardProvider = iabCardProvider;
        this.platformProvider = platformProvider;
        this.selectedTheme = this.themeProvider.getSelectedTheme();
        this.availableThemes = this.themeProvider.availableThemes;
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: LocalThemePage');
        this.themeProvider.getDetectedSystemTheme().then(theme => {
            this.autoDetectedTheme = theme;
        });
    }
    save(theme) {
        this.themeProvider.setActiveTheme(theme, this.autoDetectedTheme);
        if (this.platformProvider.isCordova) {
            this.iabCardProvider.setTheme();
        }
    }
};
LocalThemePage = __decorate([
    Component({
        selector: 'page-local-theme',
        templateUrl: 'local-theme.html'
    }),
    __metadata("design:paramtypes", [Logger,
        ThemeProvider,
        IABCardProvider,
        PlatformProvider])
], LocalThemePage);
export { LocalThemePage };
//# sourceMappingURL=local-theme.js.map