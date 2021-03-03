import { __awaiter, __decorate, __metadata } from "tslib";
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { countries } from 'countries-list';
import { NavController, NavParams } from 'ionic-angular';
import { ActionSheetProvider, GiftCardProvider, PlatformProvider } from '../../../../providers';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { getPhoneCountryCodes } from '../../../../providers/phone/phone';
import { ConfirmCardPurchasePage } from '../confirm-card-purchase/confirm-card-purchase';
let PhonePage = class PhonePage {
    constructor(actionSheetProvider, externalLinkProvider, giftCardProvider, nav, navParams, platformProvider) {
        this.actionSheetProvider = actionSheetProvider;
        this.externalLinkProvider = externalLinkProvider;
        this.giftCardProvider = giftCardProvider;
        this.nav = nav;
        this.navParams = navParams;
        this.platformProvider = platformProvider;
        this.title = 'Enable Mobile Payments?';
        this.phoneForm = new FormGroup({
            phone: new FormControl('', Validators.requiredTrue),
            agreement: new FormControl(false, Validators.requiredTrue)
        });
        if (this.platformProvider.isIOS)
            this.title = 'Enable Apple Pay?';
        else if (this.platformProvider.isAndroid)
            this.title = 'Enable Google Pay?';
    }
    ngOnInit() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cardConfig = this.navParams.get('cardConfig');
            const { phone, phoneCountryInfo: { phoneCountryCode, countryIsoCode } } = yield this.giftCardProvider.getPhoneAndCountryCode();
            const savedPhoneCountry = getSavedPhoneCountryCode(phoneCountryCode, countryIsoCode);
            const validSavedPhone = savedPhoneCountry &&
                (!this.cardConfig.allowedPhoneCountries ||
                    this.cardConfig.allowedPhoneCountries.includes(savedPhoneCountry.countryCode));
            validSavedPhone
                ? this.prefillPhone(phone, savedPhoneCountry)
                : yield this.initializeBlankPhoneInput();
            this.updateMaskAndValidators();
        });
    }
    initializeBlankPhoneInput() {
        return __awaiter(this, void 0, void 0, function* () {
            const allowedPhoneCountries = this.cardConfig.allowedPhoneCountries;
            const userCountryCode = yield this.giftCardProvider.getCountry();
            this.initialCountryCode =
                allowedPhoneCountries && !allowedPhoneCountries.includes(userCountryCode)
                    ? allowedPhoneCountries[0]
                    : userCountryCode;
            this.country = getPhoneCountryCodes().find(country => country.countryCode === this.initialCountryCode);
        });
    }
    prefillPhone(phone, phoneCountry) {
        return __awaiter(this, void 0, void 0, function* () {
            this.country = phoneCountry;
            this.phoneForm.setValue({
                phone: phone.replace(phoneCountry.phone, ''),
                agreement: false
            });
        });
    }
    openPolicy() {
        let url = 'https://bitpay.com/about/privacy';
        this.externalLinkProvider.open(url);
    }
    openOnlyOneCountrySupportedSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            const countryCode = this.cardConfig.allowedPhoneCountries[0];
            const country = countries[countryCode];
            const infoSheet = this.actionSheetProvider.createInfoSheet('one-phone-country', { country, countryCode });
            infoSheet.present();
        });
    }
    onCountryCodeClick() {
        return __awaiter(this, void 0, void 0, function* () {
            (this.cardConfig.allowedPhoneCountries || []).length === 1
                ? this.openOnlyOneCountrySupportedSheet()
                : this.openCountryCodeSheet();
        });
    }
    openCountryCodeSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            const phoneSheet = this.actionSheetProvider.createPhoneSheet({
                allowedPhoneCountries: this.cardConfig.allowedPhoneCountries
            });
            const sheetHeight = this.platformProvider.isCordova
                ? this.platformProvider.isIOS
                    ? '50vh'
                    : '70vh'
                : '90vh';
            yield phoneSheet.present({
                maxHeight: sheetHeight,
                minHeight: sheetHeight
            });
            phoneSheet.onDidDismiss(country => {
                if (!country)
                    return;
                this.country = country;
                this.updateMaskAndValidators();
            });
        });
    }
    updateMaskAndValidators() {
        this.phoneMask = getPhoneMask(this.country.phone);
        this.phoneForm.get('phone').setValidators(getValidators(this.country));
    }
    next(decline) {
        const params = Object.assign(Object.assign({}, this.navParams.data), { phone: this.getPhoneValueFromForm(decline) });
        this.nav.push(ConfirmCardPurchasePage, params);
        if (!decline)
            this.giftCardProvider.savePhone(params.phone, {
                phoneCountryCode: this.country.phone,
                countryIsoCode: this.country.countryCode
            });
    }
    getPhoneValueFromForm(decline) {
        const number = this.phoneForm
            .get('phone')
            .value.replace(/\D/g, '')
            .replace(/\D/g, '');
        return number && !decline ? `${this.country.phone}${number}` : undefined;
    }
};
PhonePage = __decorate([
    Component({
        selector: 'phone-page',
        templateUrl: 'phone.html'
    }),
    __metadata("design:paramtypes", [ActionSheetProvider,
        ExternalLinkProvider,
        GiftCardProvider,
        NavController,
        NavParams,
        PlatformProvider])
], PhonePage);
export { PhonePage };
function getValidators(country) {
    const isUS = country.phone === '1';
    return Validators.compose([
        Validators.required,
        Validators.pattern(/[0-9]/),
        Validators.minLength(isUS ? 14 : 0)
    ]);
}
function getPhoneMask(phoneCountryCode) {
    const usMask = [
        '(',
        /[1-9]/,
        /\d/,
        /\d/,
        ')',
        ' ',
        /\d/,
        /\d/,
        /\d/,
        '-',
        /\d/,
        /\d/,
        /\d/,
        /\d/
    ];
    return phoneCountryCode === '1' ? usMask : Array(15).fill(/\d/);
}
function getSavedPhoneCountryCode(phoneCountryCode, countryIsoCode) {
    const countryCodes = getPhoneCountryCodes();
    return countryCodes.find(countryCodeObj => countryCodeObj.phone === phoneCountryCode &&
        countryIsoCode === countryCodeObj.countryCode);
}
//# sourceMappingURL=phone.js.map