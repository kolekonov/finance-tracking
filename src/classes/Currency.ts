export class Currency {
    formatCurrency(value: number) {
        return value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
    }
}

export const currency = new Currency();
