import { __decorate, __metadata } from "tslib";
import { Injectable } from '@angular/core';
let TimeProvider = class TimeProvider {
    constructor() { }
    withinSameMonth(time1, time2) {
        if (!time1 || !time2)
            return false;
        let date1 = new Date(time1);
        let date2 = new Date(time2);
        return this.getMonthYear(date1) === this.getMonthYear(date2);
    }
    withinPastDay(time) {
        let now = new Date();
        let date = new Date(time);
        return now.getTime() - date.getTime() < 1000 * 60 * 60 * 24;
    }
    isDateInCurrentMonth(date) {
        let now = new Date();
        return this.getMonthYear(now) === this.getMonthYear(date);
    }
    getMonthYear(date) {
        return `${date.getMonth()}-${date.getFullYear()}`;
    }
};
TimeProvider = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], TimeProvider);
export { TimeProvider };
//# sourceMappingURL=time.js.map