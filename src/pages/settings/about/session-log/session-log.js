import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController } from 'ionic-angular';
// providers
import { ActionSheetProvider } from '../../../../providers/action-sheet/action-sheet';
import { AppProvider } from '../../../../providers/app/app';
import { ConfigProvider } from '../../../../providers/config/config';
import { Logger } from '../../../../providers/logger/logger';
import { LogsProvider } from '../../../../providers/logs/logs';
import { PlatformProvider } from '../../../../providers/platform/platform';
import * as _ from 'lodash';
let SessionLogPage = class SessionLogPage {
    constructor(configProvider, logger, actionSheetCtrl, platformProvider, translate, actionSheetProvider, appProvider, logsProvider) {
        this.configProvider = configProvider;
        this.logger = logger;
        this.actionSheetCtrl = actionSheetCtrl;
        this.platformProvider = platformProvider;
        this.translate = translate;
        this.actionSheetProvider = actionSheetProvider;
        this.appProvider = appProvider;
        this.logsProvider = logsProvider;
        this.config = this.configProvider.get();
        this.isCordova = this.platformProvider.isCordova;
        this.platform = this.isCordova
            ? this.platformProvider.isAndroid
                ? 'android'
                : 'ios'
            : 'desktop';
        const logLevels = this.logger.getLevels();
        this.logOptions = _.keyBy(logLevels, 'weight');
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: SessionLogPage');
    }
    ionViewWillEnter() {
        const selectedLevel = _.has(this.config, 'log.weight')
            ? this.logger.getWeight(this.config.log.weight)
            : this.logger.getDefaultWeight();
        this.filterValue = selectedLevel.weight;
        this.setOptionSelected(selectedLevel.weight);
        this.filterLogs(selectedLevel.weight);
    }
    filterLogs(weight) {
        this.filteredLogs = _.sortBy(this.logger.get(weight), 'timestamp');
    }
    setOptionSelected(weight) {
        this.filterLogs(weight);
        const opts = {
            log: {
                weight
            }
        };
        this.configProvider.set(opts);
    }
    showOptionsMenu() {
        const downloadText = this.translate.instant('Download logs');
        const shareText = this.translate.instant('Share logs');
        const button = [];
        button.push({
            text: this.isCordova ? shareText : downloadText,
            handler: () => {
                this.showWarningModal();
            }
        });
        const actionSheet = this.actionSheetCtrl.create({
            title: '',
            buttons: button
        });
        actionSheet.present();
    }
    showWarningModal() {
        const infoSheet = this.actionSheetProvider.createInfoSheet('sensitive-info');
        infoSheet.present();
        infoSheet.onDidDismiss(option => {
            if (option)
                this.logsProvider.get(this.appProvider.info.nameCase, this.platform);
        });
    }
};
SessionLogPage = __decorate([
    Component({
        selector: 'page-session-log',
        templateUrl: 'session-log.html'
    }),
    __metadata("design:paramtypes", [ConfigProvider,
        Logger,
        ActionSheetController,
        PlatformProvider,
        TranslateService,
        ActionSheetProvider,
        AppProvider,
        LogsProvider])
], SessionLogPage);
export { SessionLogPage };
//# sourceMappingURL=session-log.js.map