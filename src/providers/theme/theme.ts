import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';

// providers
import { ConfigProvider } from '../config/config';
import { Logger } from '../logger/logger';
import { PlatformProvider } from '../platform/platform';

declare var cordova: any;

@Injectable()
export class ThemeProvider {
  public currentAppTheme: string;
  public currentNavigationType: string;

  public availableThemes;
  public availableNavigationTypes;

  public useSystemTheme: boolean = false;

  constructor(
    private logger: Logger,
    private statusBar: StatusBar,
    private platformProvider: PlatformProvider,
    private translate: TranslateService,
    private configProvider: ConfigProvider
  ) {
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

    this.availableNavigationTypes = {
      transact: {
        name: this.translate.instant('Transact')
      },
      scan: {
        name: this.translate.instant('Scan')
      }
    };
  }

  private isEnabled(): boolean {
    const config = this.configProvider.get();
    return !!config.theme.enabled;
  }

  public load() {
    return new Promise(resolve => {
      const config = this.configProvider.get();
      this.currentNavigationType = config.navigation.type;
      if (!this.isEnabled()) return resolve();
      if (!config.theme.system) {
        this.useSystemTheme = false;
        this.currentAppTheme = config.theme.name;
        this.logger.debug('Set Stored App Theme: ' + this.currentAppTheme);
        return resolve();
      } else {
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

  public getDetectedSystemTheme(): Promise<string> {
    return new Promise(resolve => {
      if (this.platformProvider.isCordova) {
        cordova.plugins.ThemeDetection.isAvailable(
          ( res: { value: any; }) => {
            if (res && res.value) {
              cordova.plugins.ThemeDetection.isDarkModeEnabled(
                (success: { value: any; }) => {
                  return resolve(success && success.value ? 'dark' : 'light');
                },
                ( _: any) => {
                  return resolve('dark');
                }
              );
            } else {
              return resolve('dark');
            }
          },
          (_: any) => {
            return resolve('dark');
          }
        );
      } else {
        return resolve('dark');
      }
    });
  }

  public apply() {
    if (!this.isEnabled()) return;
    const isDarkMode = this.isDarkModeEnabled();
    if (this.platformProvider.isCordova) {
      setTimeout(() => {
        if (isDarkMode) {
          this.useDarkStatusBar();
        } else {
          this.useLightStatusBar();
        }
      }, 100);
    }

    // Force body background
    document.body.style.backgroundColor = this.availableThemes[
      this.currentAppTheme
    ].bodyColor;
    document
      .getElementsByTagName('ion-app')[0]
      .classList.remove('dark', 'light');
    document
      .getElementsByTagName('ion-app')[0]
      .classList.add(isDarkMode ? 'dark' : 'light');
    this.logger.debug('Apply Theme: ' + this.currentAppTheme);
  }

  public setActiveTheme(theme: string, detectedSystemTheme?: string) {
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

  public setActiveNavigationType(navigationType: string) {
    this.currentNavigationType = navigationType;
    let opts = {
      navigation: {
        type: navigationType
      }
    };
    this.configProvider.set(opts);
  }

  private setConfigTheme(): void {
    let opts = {
      theme: {
        enabled: true,
        name: this.currentAppTheme,
        system: this.useSystemTheme
      }
    };
    this.configProvider.set(opts);
  }

  public getThemeInfo(theme?: string) {
    // If no theme provided returns current theme info
    if (theme && this.availableThemes[theme])
      return this.availableThemes[theme];
    else if (this.availableThemes[this.currentAppTheme])
      return this.availableThemes[this.currentAppTheme];
    else return this.availableThemes['dark'];
  }

  public isDarkModeEnabled(): boolean {
    return Boolean(this.currentAppTheme === 'dark' || this.useSystemTheme);
  }

  public getCurrentAppTheme() {
    if (!this.isEnabled()) return;
    return this.useSystemTheme
      ? 'System Default'
      : this.availableThemes[this.currentAppTheme].name;
  }

  public getSelectedTheme() {
    return this.useSystemTheme ? 'system' : this.currentAppTheme;
  }

  public getCurrentNavigationType() {
    return this.availableNavigationTypes[this.currentNavigationType].name;
  }

  public getSelectedNavigationType() {
    return this.configProvider.get().navigation.type;
  }

  private useDarkStatusBar() {
    this.statusBar.backgroundColorByHexString(
      this.availableThemes['dark'].backgroundColor
    );
    this.statusBar.styleBlackOpaque();
  }

  private useLightStatusBar() {
    this.statusBar.backgroundColorByHexString(
      this.availableThemes['light'].backgroundColor
    );
    this.statusBar.styleDefault();
  }

  public useCustomStatusBar(color) {
    this.statusBar.backgroundColorByHexString(color);
    this.statusBar.styleBlackOpaque();
  }

  public useDefaultStatusBar() {
    if (this.isDarkModeEnabled()) {
      this.useDarkStatusBar();
    } else {
      this.useLightStatusBar();
    }
  }
}
