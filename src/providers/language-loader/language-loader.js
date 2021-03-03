import { __decorate, __metadata } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import * as gettext from 'gettext-parser';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { PlatformProvider } from '../platform/platform';
let LanguageLoader = class LanguageLoader {
    constructor(http, file, platformProvider) {
        this.http = http;
        this.file = file;
        this.platformProvider = platformProvider;
        this.domain = '';
        this._prefix = 'assets/i18n/';
        this._suffix = '.po';
    }
    getTranslation(lang) {
        if (this.platformProvider.isCordova) {
            return Observable.fromPromise(this.file
                .readAsText(this.file.applicationDirectory + 'www/', `${this._prefix}/${lang}${this._suffix}`)
                .then(data => {
                return this.parse(data);
            }));
        }
        else {
            return this.http
                .get(`${this._prefix}/${lang}${this._suffix}`, { responseType: 'text' })
                .pipe(map((contents) => this.parse(contents)));
        }
    }
    parse(contents) {
        let translations = {};
        const po = gettext.po.parse(contents, 'utf-8');
        if (!po.translations.hasOwnProperty(this.domain)) {
            return translations;
        }
        Object.keys(po.translations[this.domain]).forEach(key => {
            const translation = po.translations[this.domain][key].msgstr.pop();
            if (key.length > 0 && translation.length > 0) {
                translations[key] = translation;
            }
        });
        return translations;
    }
};
LanguageLoader = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient,
        File,
        PlatformProvider])
], LanguageLoader);
export { LanguageLoader };
//# sourceMappingURL=language-loader.js.map