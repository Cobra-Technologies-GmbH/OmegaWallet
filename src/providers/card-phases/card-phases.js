import { __decorate, __metadata } from "tslib";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
let CardPhasesProvider = class CardPhasesProvider {
    constructor(http) {
        this.http = http;
        this.allowedCountries = [
            'US',
            'AX',
            'AL',
            'AD',
            'AI',
            'AG',
            'AR',
            'AM',
            'AW',
            'AU',
            'AT',
            'AZ',
            'BS',
            'BH',
            'BB',
            'BY',
            'BE',
            'BZ',
            'BM',
            'BT',
            'BQ',
            'BA',
            'BR',
            'BN',
            'BG',
            'CA',
            'KY',
            'CL',
            'CN',
            'CO',
            'CR',
            'HR',
            'CW',
            'CY',
            'CZ',
            'DK',
            'DM',
            'DO',
            'EC',
            'SV',
            'EE',
            'FK',
            'FO',
            'FI',
            'FR',
            'GF',
            'GE',
            'DE',
            'GI',
            'GR',
            'GL',
            'GD',
            'GP',
            'GT',
            'GG',
            'GY',
            'HK',
            'HU',
            'IS',
            'ID',
            'IE',
            'IM',
            'IL',
            'IT',
            'JM',
            'JP',
            'JE',
            'JO',
            'KZ',
            'KR',
            'KW',
            'LV',
            'LI',
            'LT',
            'LU',
            'MK',
            'MY',
            'MV',
            'MT',
            'MQ',
            'MU',
            'MX',
            'MD',
            'MC',
            'MN',
            'ME',
            'MA',
            'NP',
            'NL',
            'NZ',
            'NI',
            'NO',
            'OM',
            'PA',
            'PG',
            'PY',
            'PE',
            'PH',
            'PL',
            'PT',
            'QA',
            'RE',
            'RO',
            'RU',
            'KN',
            'LC',
            'MF',
            'VC',
            'SM',
            'SA',
            'RS',
            'SC',
            'SG',
            'SX',
            'SK',
            'SI',
            'SB',
            'ZA',
            'ES',
            'SR',
            'SE',
            'CH',
            'TW',
            'TH',
            'TT',
            'TR',
            'TC',
            'UA',
            'AE',
            'GB',
            'UY',
            'VG'
        ];
        this.otherCardCountries = ['AU', 'MX', 'CA'];
    }
    getSession() {
        const url = 'https://bitpay.com/visa-api/session';
        return this.http.get(url);
    }
    notify(email, country) {
        const url = 'https://bitpay.com/api/v2';
        let httpHeaders = new HttpHeaders();
        httpHeaders = httpHeaders.set('Content-Type', 'application/json; charset=utf-8');
        const options = {
            headers: httpHeaders
        };
        let params = {
            email,
            country,
            cardType: country === 'US' ? 'USCard' : 'EuropeCard',
            created: new Date(),
            topic: 'debitCard'
        };
        if (this.otherCardCountries.includes(country)) {
            params = Object.assign(Object.assign({}, params), { cardType: 'OtherCard' });
        }
        const body = {
            method: 'interested',
            params: JSON.stringify(params)
        };
        return this.http.post(url, body, options);
    }
    countries() {
        const url = 'https://bitpay.com/countries';
        return this.http.get(url).pipe(filter(c => this.allowedCountries.indexOf(c['shortCode']) !== -1), map(c => {
            return {
                label: c['name'],
                value: c['shortCode']
            };
        }));
    }
};
CardPhasesProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpClient])
], CardPhasesProvider);
export { CardPhasesProvider };
//# sourceMappingURL=card-phases.js.map