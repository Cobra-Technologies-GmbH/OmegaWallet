import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { getPhoneCountryCodes } from '../../providers/phone/phone';
import { ActionSheetParent } from '../action-sheet/action-sheet-parent';
let PhoneSheet = class PhoneSheet extends ActionSheetParent {
    constructor() {
        super();
        this.searchQuery = '';
        this.searchQuerySubject = new Subject();
        this.searchQuerySubject.pipe(debounceTime(300)).subscribe(query => {
            this.searchQuery = query;
            this.updateCountryList();
        });
    }
    ngOnInit() {
        this.updateCountryList();
    }
    onSearch(query) {
        this.searchQuerySubject.next(query);
    }
    selectCountry(country) {
        this.dismiss(country);
    }
    updateCountryList() {
        const allCountries = getPhoneCountryCodes(this.params.allowedPhoneCountries);
        this.countries = this.searchQuery
            ? allCountries.filter(country => country.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
            : allCountries;
    }
};
PhoneSheet = __decorate([
    Component({
        selector: 'phone-sheet',
        templateUrl: 'phone-sheet.html'
    }),
    __metadata("design:paramtypes", [])
], PhoneSheet);
export { PhoneSheet };
//# sourceMappingURL=phone-sheet.js.map