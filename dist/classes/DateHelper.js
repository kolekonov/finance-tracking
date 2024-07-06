"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DateHelper {
    constructor() {
        DateHelper.currentDate = new Date();
    }
    getFirstDayInMonth() {
        return new Date(DateHelper.currentDate.getFullYear(), DateHelper.currentDate.getMonth(), 1);
    }
    getLastDayInMonth() {
        return new Date(DateHelper.currentDate.getFullYear(), DateHelper.currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }
}
const dateHelper = new DateHelper();
exports.default = dateHelper;
