import { __awaiter, __decorate, __metadata } from "tslib";
import { Component, HostBinding, Input, NgZone } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs';
import { DomProvider } from '../../providers/dom/dom';
let ActionSheetComponent = class ActionSheetComponent {
    constructor(domProvider, platform, zone) {
        this.domProvider = domProvider;
        this.platform = platform;
        this.zone = zone;
        this.maxHeight = '90vh';
        this.minHeight = 'unset';
        this.transitionDuration = 250;
        this.slideIn = false;
    }
    ngOnInit() {
        this.overrideHardwareBackButton();
    }
    present(componentRef, params = {
        maxHeight: '90vh',
        minHeight: 'unset'
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.parentComponentRef = componentRef;
            yield Observable.timer(50).toPromise();
            this.zone.run(() => {
                this.maxHeight = params.maxHeight;
                this.minHeight = params.minHeight;
                this.slideIn = true;
            });
        });
    }
    dismiss(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.zone.run(() => (this.slideIn = false));
            this.dismissFunction && this.dismissFunction(data);
            yield Observable.timer(this.transitionDuration).toPromise();
            this.domProvider.removeComponent(this.parentComponentRef);
        });
    }
    overrideHardwareBackButton() {
        this.deregisterBackButtonAction = this.platform.registerBackButtonAction(() => this.dismiss());
    }
    ngOnDestroy() {
        this.deregisterBackButtonAction();
    }
};
__decorate([
    HostBinding('class.open'),
    __metadata("design:type", Boolean)
], ActionSheetComponent.prototype, "slideIn", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], ActionSheetComponent.prototype, "fromTop", void 0);
ActionSheetComponent = __decorate([
    Component({
        selector: 'action-sheet',
        templateUrl: 'action-sheet.html'
    }),
    __metadata("design:paramtypes", [DomProvider,
        Platform,
        NgZone])
], ActionSheetComponent);
export { ActionSheetComponent };
//# sourceMappingURL=action-sheet.js.map