/*
 * Example use
 *  Simple: *ngFor="let item of giftCards | keys"
 *	With an object with objects: *ngFor="let item of (itemsObject | keys : 'date') | orderBy : ['-order']"
 */
import { __decorate } from "tslib";
import { Pipe } from '@angular/core';
let KeysPipe = class KeysPipe {
    transform(value, orderBy) {
        let keys = [];
        for (let key in value) {
            keys.push({
                key,
                value: value[key],
                order: orderBy ? value[key][orderBy] : null
            });
        }
        return keys;
    }
};
KeysPipe = __decorate([
    Pipe({
        name: 'keys'
    })
], KeysPipe);
export { KeysPipe };
//# sourceMappingURL=keys.js.map