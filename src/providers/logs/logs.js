import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
// native
import { SocialSharing } from '@ionic-native/social-sharing';
// providers
import { DownloadProvider } from '../../providers/download/download';
import { Logger } from '../../providers/logger/logger';
let LogsProvider = class LogsProvider {
    constructor(logger, downloadProvider, socialSharing) {
        this.logger = logger;
        this.downloadProvider = downloadProvider;
        this.socialSharing = socialSharing;
        this.logger.debug('LogsProvider initialized');
    }
    get(app, platform) {
        if (platform != 'desktop')
            this.share(app, platform);
        else
            this.download(app);
    }
    prepareSessionLogs() {
        let log = 'Session Logs.\nBe careful, this could contain sensitive private data\n\n';
        log += '\n\n';
        const weight = 4; // share complete logs
        const logs = _.sortBy(this.logger.get(weight), 'timestamp');
        Object.keys(logs).forEach(key => {
            log +=
                '[' +
                    logs[key].timestamp +
                    '][' +
                    logs[key].level +
                    ']' +
                    logs[key].msg +
                    '\n';
        });
        return log;
    }
    download(app) {
        const logs = this.prepareSessionLogs();
        const now = new Date().toISOString();
        const filename = app + '-logs ' + now + '.txt';
        this.downloadProvider.download(logs, filename);
    }
    share(app, platform) {
        const logs = this.prepareSessionLogs();
        const now = new Date().toISOString();
        const subject = app + '-logs ' + now;
        const message = 'Session Logs. Be careful, this could contain sensitive private data';
        const blob = new Blob([logs], { type: 'text/txt' });
        const reader = new FileReader();
        reader.onload = event => {
            const attachment = event.target.result; // <-- data url
            if (platform == 'android') {
                this.shareAndroid(message, subject, attachment);
            }
            else {
                this.shareIOS(message, subject, attachment);
            }
        };
        reader.readAsDataURL(blob);
    }
    shareAndroid(message, subject, attachment) {
        // share via email with attachment is not working correctly in some android versions
        // so instead of shareViaEmail() -> share()
        this.socialSharing.share(message, subject, attachment).catch(err => {
            this.logger.error('socialSharing Error: ', err);
        });
    }
    shareIOS(message, subject, attachment) {
        // Check if sharing via email is supported
        this.socialSharing
            .canShareViaEmail()
            .then(() => {
            this.logger.info('sharing via email is possible');
            this.socialSharing
                .shareViaEmail(message, subject, null, // TO: must be null or an array
            null, // CC: must be null or an array
            null, // BCC: must be null or an array
            attachment // FILES: can be null, a string, or an array
            )
                .then(data => {
                this.logger.info('Email created successfully: ', data);
            })
                .catch(err => {
                this.logger.error('socialSharing Error: ', err);
            });
        })
            .catch(() => {
            this.logger.warn('sharing via email is not possible');
            this.socialSharing
                .share(message, subject, attachment // FILES: can be null, a string, or an array
            )
                .catch(err => {
                this.logger.error('socialSharing Error: ', err);
            });
        });
    }
};
LogsProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger,
        DownloadProvider,
        SocialSharing])
], LogsProvider);
export { LogsProvider };
//# sourceMappingURL=logs.js.map