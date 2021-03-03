import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Logger } from '../../providers/logger/logger';
let DownloadProvider = class DownloadProvider {
    constructor(logger) {
        this.logger = logger;
        this.logger.debug('DownloadProvider initialized');
    }
    download(ew, fileName) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield Observable.timer(1000).toPromise();
            let a = document.createElement('a');
            let blob = this.newBlob(ew, 'text/plain;charset=utf-8');
            let url = window.URL.createObjectURL(blob);
            document.body.appendChild(a);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
            return resolve();
        }));
    }
    newBlob(data, datatype) {
        let out;
        try {
            this.logger.debug('Trying to blob data');
            out = new Blob([data], {
                type: datatype
            });
        }
        catch (e) {
            if (e.name == 'InvalidStateError') {
                // InvalidStateError (tested on FF13 WinXP)
                this.logger.debug('Invalid state Error: Trying to blob data again');
                out = new Blob([data], {
                    type: datatype
                });
            }
            else {
                // We're screwed, blob constructor unsupported entirely
                this.logger.error('Error: blob constructor unsupported entirely');
            }
        }
        return out;
    }
};
DownloadProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger])
], DownloadProvider);
export { DownloadProvider };
//# sourceMappingURL=download.js.map