import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { CurrencyProvider } from '../../providers/currency/currency';
import { PlatformProvider } from '../../providers/platform/platform';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let IncomingDataMenuComponent = class IncomingDataMenuComponent extends ActionSheetParent {
    constructor(currencyProvider, platformProvider) {
        super();
        this.currencyProvider = currencyProvider;
        this.platformProvider = platformProvider;
        this.isCordova = this.platformProvider.isCordova;
    }
    ngOnInit() {
        this.data = this.params.data.data;
        this.type = this.params.data.type;
        this.coin = this.params.data.coin;
        this.coinName = this.coin && this.currencyProvider.getCoinName(this.coin);
        this.fromHomeCard = this.params.data.fromHomeCard;
    }
    close(redirTo, value) {
        this.dismiss({ redirTo, value, coin: this.coin });
    }
};
IncomingDataMenuComponent = __decorate([
    Component({
        selector: 'incoming-data-menu',
        templateUrl: 'incoming-data-menu.html'
    }),
    __metadata("design:paramtypes", [CurrencyProvider,
        PlatformProvider])
], IncomingDataMenuComponent);
export { IncomingDataMenuComponent };
//# sourceMappingURL=incoming-data-menu.js.map