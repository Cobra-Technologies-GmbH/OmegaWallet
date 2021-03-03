import { __decorate, __metadata } from "tslib";
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Content } from 'ionic-angular';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
let SearchBarComponent = class SearchBarComponent {
    constructor() {
        this.search = new EventEmitter();
        this.debouncer = new Subject();
    }
    ngOnInit() {
        this.debouncer
            .pipe(debounceTime(200))
            .subscribe(value => this.search.emit(value));
        this.scrollArea &&
            this.scrollArea.ionScroll.subscribe(() => {
                const activeElement = document.activeElement;
                activeElement && activeElement.blur && activeElement.blur();
            });
    }
    onSearch($event) {
        this.debouncer.next($event);
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], SearchBarComponent.prototype, "placeholder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Content)
], SearchBarComponent.prototype, "scrollArea", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], SearchBarComponent.prototype, "search", void 0);
SearchBarComponent = __decorate([
    Component({
        host: { class: 'search-bar' },
        selector: 'search-bar',
        template: `
    <ion-input
      [placeholder]="placeholder"
      (input)="onSearch($event)"
    ></ion-input>
  `
    })
], SearchBarComponent);
export { SearchBarComponent };
//# sourceMappingURL=search-bar.js.map