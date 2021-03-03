import { countries } from 'countries-list';
export function getPhoneCountryCodes(allowedPhoneCountries) {
    const countryCodes = Object.keys(countries);
    const countryList = Object.values(countries);
    const countryListWithCodes = countryList
        .map((country, index) => (Object.assign(Object.assign({}, country), { countryCode: countryCodes[index] })))
        .filter(country => allowedPhoneCountries
        ? allowedPhoneCountries.includes(country.countryCode)
        : true);
    const countriesWithMultiplePhoneCodes = countryListWithCodes
        .filter(country => country.phone.includes(','))
        .map(country => {
        const codes = country.phone.split(',');
        return codes.map(code => (Object.assign(Object.assign({}, country), { phone: code })));
    });
    const countriesWithSinglePhoneCode = countryListWithCodes.filter(country => !country.phone.includes(','));
    const multiplePhoneCodesFlattened = [].concat.apply([], countriesWithMultiplePhoneCodes);
    return countriesWithSinglePhoneCode
        .concat(multiplePhoneCodesFlattened)
        .sort((a, b) => (a.name < b.name ? -1 : 1));
}
//# sourceMappingURL=phone.js.map