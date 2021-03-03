import { __awaiter, __decorate, __metadata } from "tslib";
import { Directive, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ExternalLinkProvider } from '../../providers';
let ExternalizeLinks = class ExternalizeLinks {
    constructor(element, externalLinkProvider) {
        this.element = element;
        this.externalLinkProvider = externalLinkProvider;
    }
    ngAfterViewInit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Observable.timer(500).toPromise();
            this.getAllLinks().forEach(aTag => aTag.addEventListener('click', this.handleClick.bind(this)));
        });
    }
    ngOnDestroy() {
        this.getAllLinks().forEach(aTag => {
            aTag.removeEventListener('click', this.handleClick.bind(this));
        });
    }
    getAllLinks() {
        return this.element.nativeElement.querySelectorAll('a');
    }
    handleClick(event) {
        event.preventDefault();
        this.openExternalLink(event.srcElement.href);
    }
    openExternalLink(url) {
        this.externalLinkProvider.open(url);
    }
};
ExternalizeLinks = __decorate([
    Directive({
        selector: '[externalize-links]'
    }),
    __metadata("design:paramtypes", [ElementRef,
        ExternalLinkProvider])
], ExternalizeLinks);
export { ExternalizeLinks };
//# sourceMappingURL=externalize-links.js.map