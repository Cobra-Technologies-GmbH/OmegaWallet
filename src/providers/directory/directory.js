import { __awaiter, __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
import { Logger } from '../logger/logger';
export const getDirectIntegrations = (res) => Object.keys(res).map(name => (Object.assign(Object.assign({}, res[name]), { name })));
export function fetchDirectIntegrations() {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(`https://bitpay.com/merchant-directory/integrations`)
            .then(res => res.json())
            .then((merchantMap) => getDirectIntegrations(merchantMap));
    });
}
export function convertToArray(object) {
    return Object.keys(object).map(key => (Object.assign({ name: key }, object[key])));
}
export function convertObjectsToArrays(directory) {
    const categories = convertToArray(directory.categories);
    const curated = convertToArray(directory.curated);
    const newDirectory = { curated, categories };
    return newDirectory;
}
export function fetchDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        const directory = yield fetch(`https://bitpay.com/merchant-directory/directory`).then(res => res.json());
        const newDirectory = convertObjectsToArrays(directory);
        return newDirectory;
    });
}
let DirectoryProvider = class DirectoryProvider {
    constructor(logger) {
        this.logger = logger;
    }
    fetchDirectIntegrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const directIntegrations = yield fetchDirectIntegrations();
            this.logger.debug('fetched Direct Integrations');
            return directIntegrations;
        });
    }
    fetchDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            const directory = yield fetchDirectory();
            this.logger.debug('fetched Directory');
            return directory;
        });
    }
};
DirectoryProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Logger])
], DirectoryProvider);
export { DirectoryProvider };
//# sourceMappingURL=directory.js.map