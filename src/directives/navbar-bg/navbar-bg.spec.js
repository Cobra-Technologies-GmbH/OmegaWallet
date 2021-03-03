import { __decorate, __metadata } from "tslib";
import { Component, ElementRef } from '@angular/core';
import { async } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { NavbarBg } from './navbar-bg';
let fixture;
let instance;
let toolbarBg;
let TestHostComponent = class TestHostComponent {
    constructor(element) {
        this.element = element;
        this.color = 'blue';
    }
};
TestHostComponent = __decorate([
    Component({
        template: ` <ion-navbar [navbar-bg]="color"></ion-navbar> `
    }),
    __metadata("design:paramtypes", [ElementRef])
], TestHostComponent);
describe('NavbarBg', () => {
    beforeEach(async(() => TestUtils.beforeEachCompiler([TestHostComponent, NavbarBg]).then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
        fixture.detectChanges();
        toolbarBg = instance.element.nativeElement.getElementsByClassName('toolbar-background')[0];
    })));
    afterEach(() => {
        fixture.destroy();
    });
    it('should set the navbar bg color to the specified color', () => {
        expect(toolbarBg.style.background).toBe('blue');
    });
    it('should remove the navbar bg color if none specified', () => {
        instance.color = null;
        fixture.detectChanges();
        expect(toolbarBg.style.background).toBe('');
    });
});
//# sourceMappingURL=navbar-bg.spec.js.map