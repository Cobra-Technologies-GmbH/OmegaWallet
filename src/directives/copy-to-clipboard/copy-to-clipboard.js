import { __decorate, __metadata, __param } from "tslib";
import { Directive, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { Clipboard } from '@ionic-native/clipboard';
import { TranslateService } from '@ngx-translate/core';
// providers
import { ActionSheetProvider } from '../../providers/action-sheet/action-sheet';
import { ClipboardProvider } from '../../providers/clipboard/clipboard';
import { Logger } from '../../providers/logger/logger';
import { PlatformProvider } from '../../providers/platform/platform';
let CopyToClipboard = class CopyToClipboard {
    constructor(dom, clipboard, platform, logger, translate, actionSheetProvider, clipboardProvider) {
        this.clipboard = clipboard;
        this.platform = platform;
        this.logger = logger;
        this.translate = translate;
        this.actionSheetProvider = actionSheetProvider;
        this.clipboardProvider = clipboardProvider;
        this.dom = dom;
    }
    copyBrowser() {
        let textarea = this.dom.createElement('textarea');
        this.dom.body.appendChild(textarea);
        textarea.value = this.value;
        textarea.select();
        this.dom.execCommand('copy');
        this.dom.body.removeChild(textarea);
    }
    copy() {
        if (!this.value)
            return;
        try {
            this.clipboardProvider.copy(this.value);
        }
        catch (e) {
            if (e)
                this.logger.warn(e.message);
            this.copyBrowser();
        }
        if (this.hideToast)
            return;
        const infoSheet = this.actionSheetProvider.createInfoSheet('copy-to-clipboard', { msg: this.value });
        infoSheet.present();
    }
};
CopyToClipboard = __decorate([
    Directive({
        selector: '[copy-to-clipboard]',
        inputs: ['value: copy-to-clipboard', 'hideToast: hide-toast'],
        host: {
            '(click)': 'copy()'
        }
    }),
    __param(0, Inject(DOCUMENT)),
    __metadata("design:paramtypes", [Document,
        Clipboard,
        PlatformProvider,
        Logger,
        TranslateService,
        ActionSheetProvider,
        ClipboardProvider])
], CopyToClipboard);
export { CopyToClipboard };
//# sourceMappingURL=copy-to-clipboard.js.map