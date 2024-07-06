"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currency = exports.Currency = void 0;
class Currency {
    formatCurrency(value) {
        return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
    }
}
exports.Currency = Currency;
exports.currency = new Currency();
