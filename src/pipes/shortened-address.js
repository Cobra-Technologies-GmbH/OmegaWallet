import { __decorate, __metadata } from "tslib";
import { Pipe } from '@angular/core';
import { IncomingDataProvider } from '../providers/incoming-data/incoming-data';
let ShortenedAddressPipe = class ShortenedAddressPipe {
    constructor(incomingDataProvider) {
        this.incomingDataProvider = incomingDataProvider;
    }
    transform(address) {
        if (!address || address === '')
            return '...';
        const addr = this.incomingDataProvider.extractAddress(address);
        if (addr && addr.length > 4) {
            const first4Numbers = addr.substr(0, 4);
            const last4Numbers = addr.substr(addr.length - 4, addr.length);
            const result = first4Numbers + '...' + last4Numbers;
            return result;
        }
        else {
            return '...';
        }
    }
};
ShortenedAddressPipe = __decorate([
    Pipe({
        name: 'shortenedAddress',
        pure: false
    }),
    __metadata("design:paramtypes", [IncomingDataProvider])
], ShortenedAddressPipe);
export { ShortenedAddressPipe };
//# sourceMappingURL=shortened-address.js.map