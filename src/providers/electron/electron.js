import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
let ElectronProvider = class ElectronProvider {
    constructor(logger) {
        this.logger = logger;
        this.logger.debug('ElectronProvider initialized');
    }
    readFromClipboard() {
        const { clipboard } = window.require('electron');
        return clipboard.readText();
    }
    writeToClipboard(text) {
        const { clipboard } = window.require('electron');
        return clipboard.writeText(text);
    }
    clearClipboard() {
        const { clipboard } = window.require('electron');
        clipboard.clear();
    }
    openExternalLink(url) {
        const { shell } = window.require('electron');
        return shell.openExternal(url);
    }
};
ElectronProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger])
], ElectronProvider);
export { ElectronProvider };
//# sourceMappingURL=electron.js.map