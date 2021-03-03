import { __decorate, __metadata } from "tslib";
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';
import { DomProvider } from './dom';
let DomProviderMock = class DomProviderMock extends DomProvider {
    constructor(componentFactoryResolver, injector, appRef) {
        super(componentFactoryResolver, injector, appRef);
    }
    appendToDom() { }
};
DomProviderMock = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ComponentFactoryResolver,
        Injector,
        ApplicationRef])
], DomProviderMock);
export { DomProviderMock };
//# sourceMappingURL=dom.mock.js.map