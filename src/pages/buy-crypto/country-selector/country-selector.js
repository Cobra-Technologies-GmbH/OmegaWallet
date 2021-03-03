import { __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
// Providers
import { BitPayProvider } from '../../../providers/bitpay/bitpay';
import { Logger } from '../../../providers/logger/logger';
import { PersistenceProvider } from '../../../providers/persistence/persistence';
import * as _ from 'lodash';
let CountrySelectorPage = class CountrySelectorPage {
    constructor(logger, viewCtrl, persistenceProvider, navParams, bitPayProvider) {
        this.logger = logger;
        this.viewCtrl = viewCtrl;
        this.persistenceProvider = persistenceProvider;
        this.navParams = navParams;
        this.bitPayProvider = bitPayProvider;
        this.PAGE_COUNTER = 3;
        this.SHOW_LIMIT = 10;
        this.completeCountryList = [];
        this.countryList = [];
        this.commonCountriesList = [
            {
                name: 'United States',
                phonePrefix: '+1',
                shortCode: 'US',
                threeLetterCode: 'USA'
            }
        ];
        this.persistenceProvider.getLastCountryUsed().then(lastUsedCountry => {
            if (lastUsedCountry &&
                _.isObject(lastUsedCountry) &&
                lastUsedCountry.threeLetterCode != 'USA') {
                this.commonCountriesList.unshift(lastUsedCountry);
            }
        });
        this.EUCountries = [
            'AT',
            'BE',
            'BG',
            'HR',
            'CY',
            'CZ',
            'DK',
            'EE',
            'FI',
            'FR',
            'DE',
            'GR',
            'HU',
            'IS',
            'IE',
            'IT',
            'LV',
            'LT',
            'LU',
            'MT',
            'NL',
            'NO',
            'PL',
            'PT',
            'RO',
            'SK',
            'SI',
            'ES',
            'SE',
            'CH',
            'GB' // United Kingdom (Great Britain)
        ];
        this.completeCountryList = this.navParams.data.countryList;
        this.setEUCountries();
    }
    ionViewDidLoad() {
        this.logger.info('Loaded: CountrySelectorPage');
    }
    ionViewWillEnter() {
        this.useAsModal = this.navParams.data.useAsModal;
        if (_.isEmpty(this.completeCountryList)) {
            this.bitPayProvider.get('/countries', ({ data }) => {
                this.persistenceProvider.setCountries(data);
                this.completeCountryList = data;
                this.setEUCountries();
                this.countryList = this.completeCountryList.slice(0, 20);
            }, () => { });
        }
        else {
            this.countryList = this.completeCountryList.slice(0, 20);
        }
    }
    loadCountries(loading) {
        if (this.countryList.length === this.completeCountryList.length) {
            loading.complete();
            return;
        }
        setTimeout(() => {
            this.countryList = this.completeCountryList.slice(0, this.PAGE_COUNTER * this.SHOW_LIMIT);
            this.PAGE_COUNTER++;
            if (this.searchedCountry)
                this.findCountry();
            loading.complete();
        }, 300);
    }
    save(selectedCountry) {
        this.persistenceProvider.setLastCountryUsed(selectedCountry);
        this.viewCtrl.dismiss({ selectedCountry });
    }
    findCountry() {
        this.countryList = _.filter(this.completeCountryList, item => {
            var val = item.name;
            var val2 = item.threeLetterCode;
            return (_.includes(val.toLowerCase(), this.searchedCountry.toLowerCase()) ||
                _.includes(val2.toLowerCase(), this.searchedCountry.toLowerCase()));
        });
    }
    setEUCountries() {
        this.completeCountryList.forEach(country => {
            if (country.shortCode && this.EUCountries.includes(country.shortCode)) {
                country.EUCountry = true;
            }
        });
    }
    close() {
        this.viewCtrl.dismiss();
    }
};
CountrySelectorPage = __decorate([
    Component({
        selector: 'page-country-selector',
        templateUrl: 'country-selector.html'
    }),
    __metadata("design:paramtypes", [Logger,
        ViewController,
        PersistenceProvider,
        NavParams,
        BitPayProvider])
], CountrySelectorPage);
export { CountrySelectorPage };
//# sourceMappingURL=country-selector.js.map