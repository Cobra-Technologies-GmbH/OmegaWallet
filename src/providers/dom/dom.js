import { __decorate, __metadata } from "tslib";
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';
let DomProvider = class DomProvider {
    constructor(componentFactoryResolver, injector, appRef) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.injector = injector;
        this.appRef = appRef;
    }
    appendComponentToBody(component) {
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(component)
            .create(this.injector);
        this.appRef.attachView(componentRef.hostView);
        const domElem = componentRef.hostView
            .rootNodes[0];
        this.appendToDom(domElem);
        return componentRef;
    }
    appendToDom(domElem) {
        document.getElementsByTagName('ion-app')[0].appendChild(domElem);
    }
    removeComponent(componentRef) {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
    }
};
DomProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ComponentFactoryResolver,
        Injector,
        ApplicationRef])
], DomProvider);
export { DomProvider };
//# sourceMappingURL=dom.js.map