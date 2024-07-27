"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DateHelper_1 = __importDefault(require("./DateHelper"));
const Rate_1 = __importDefault(require("./Rate"));
const PrismaSingleton_1 = __importDefault(require("./PrismaSingleton"));
const Currency_1 = require("./Currency");
class Finance {
    constructor(prisma, dependencies) {
        this.prisma = prisma;
        this.rate = dependencies.rate;
        this.currency = dependencies.currency;
        Finance.dateHelper = dependencies.dateHelper;
        Finance.fillFinanceTypeArray();
    }
    static fillFinanceTypeArray() {
        for (const type in Finance.financeTypesMap) {
            Finance.financeTypes.push(type);
        }
    }
    getFinanceTypeName(englishName) {
        let neededName = '';
        for (const key in Finance.financeTypesMap) {
            if (englishName === Finance.financeTypesMap[key]) {
                neededName = key;
                break;
            }
        }
        return neededName;
    }
    saveToDb({ price, desc, type, user, transfer, investments }) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentRateObj = yield this.rate.getRate();
            const currentRate = (currentRateObj === null || currentRateObj === void 0 ? void 0 : currentRateObj.rate) ? currentRateObj === null || currentRateObj === void 0 ? void 0 : currentRateObj.rate : 1;
            return yield this.prisma.finance.create({
                data: {
                    value: price * currentRate,
                    desc: desc,
                    type: type,
                    createAt: new Date(),
                    rate: currentRate,
                    flag: process.env.ENVIRONMENT,
                    user: user,
                    transfer: transfer,
                    investments: investments,
                },
            });
        });
    }
    // Временный метод 
    getAllRows() {
        return __awaiter(this, void 0, void 0, function* () {
            const finances = yield this.prisma.finance.findMany();
            for (const row of finances) {
                const update = yield this.prisma.finance.update({
                    where: {
                        id: row.id,
                    },
                    data: {
                        user: 1
                    }
                });
                console.log(update);
            }
        });
    }
    removeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.finance.delete({
                where: {
                    id: id,
                }
            });
        });
    }
    removeLastRow() {
        return __awaiter(this, void 0, void 0, function* () {
            const lastRow = yield this.prisma.finance.findFirst({
                orderBy: {
                    id: "desc",
                }
            });
            if (lastRow === null || lastRow === void 0 ? void 0 : lastRow.id) {
                return yield this.removeById(lastRow.id);
            }
            return false;
        });
    }
    checkFinanceTypes(type) {
        if (Finance.financeTypes.includes(type)) {
            return true;
        }
        return false;
    }
    getFinanceTypeCode(type) {
        return Finance.financeTypesMap[type]
            ? Finance.financeTypesMap[type]
            : "unknown";
    }
    getFinanceTypesArray() {
        return Finance.financeTypes;
    }
    static prepareExpensesResultObject(list) {
        const result = {};
        list.forEach((item) => {
            let price = item.value;
            if (Finance.specialFinances.includes(item.type)) {
                price = item[item.type];
            }
            if (result[item.type]) {
                result[item.type] += price;
            }
            else {
                result[item.type] = price;
            }
        });
        return result;
    }
    static getSpecialExpenses(rawExpenses) {
        let sum = 0;
        for (const key in rawExpenses) {
            if (!Finance.specialFinances.includes(key)) {
                continue;
            }
            sum += rawExpenses[key];
        }
        return sum;
    }
    static prepareExpensesMdString(rawExpenses) {
        let res = "";
        let realType = "unknown";
        let sum = 0;
        for (const key in rawExpenses) {
            sum += rawExpenses[key];
            for (const financeKey in Finance.financeTypesMap) {
                if (Finance.financeTypesMap[financeKey] === key) {
                    realType = financeKey;
                }
            }
            res += `${realType} : ${Currency_1.currency.formatCurrency(rawExpenses[key])} \n`;
        }
        const specialExpenses = Finance.getSpecialExpenses(rawExpenses);
        res += `\nВсего потрачено: *${Currency_1.currency.formatCurrency(sum)}*`;
        res += `\n\n ▶️ Особенные траты: *${Currency_1.currency.formatCurrency(specialExpenses)}*`;
        res += `\n ▶️ Безвозратно потрачено : *${Currency_1.currency.formatCurrency(sum - specialExpenses)}*`;
        return res;
    }
    getMonthlyExpenses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryObject = {
                where: {
                    createAt: {
                        gte: Finance.dateHelper.getFirstDayInMonth(),
                        lte: Finance.dateHelper.getLastDayInMonth(),
                    },
                },
            };
            if (userId !== 0) {
                if (!queryObject.where) {
                    queryObject.where = {};
                }
                queryObject.where['user'] = userId;
            }
            const expensesList = yield PrismaSingleton_1.default.finance.findMany(queryObject);
            return Finance.prepareExpensesResultObject(expensesList);
        });
    }
    getAllExpenses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryObject = {};
            if (userId !== 0) {
                if (!queryObject.where) {
                    queryObject.where = {};
                }
                queryObject.where['user'] = userId;
            }
            const expensesList = yield PrismaSingleton_1.default.finance.findMany(queryObject);
            return Finance.prepareExpensesResultObject(expensesList);
        });
    }
    showMonthlyExpensesAsMdString(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawExpenses = yield this.getMonthlyExpenses(userId);
            let mdString = "*Траты за месяц* \n\n";
            mdString += Finance.prepareExpensesMdString(rawExpenses);
            return mdString;
        });
    }
    showAllExpensesAsMdString(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawExpenses = yield this.getAllExpenses(userId);
            let mdString = "*Траты за все время* \n\n";
            mdString += Finance.prepareExpensesMdString(rawExpenses);
            return mdString;
        });
    }
}
Finance.financeTypes = [];
Finance.financeTypesMap = {
    "🍇 Еда/Быт": "food",
    "🍜 Кафе/Рестораны": "restaurants",
    "🛤️ Путешествия": "trips",
    "😁 Здоровье": "health",
    "💸 Покупки": "buy",
    "🍜 Жилье": "home",
    "🚗 Транспорт": "transport",
    "✏️ Подписки": "subscriptions",
    "🎁 Подарки": "gifts",
    "😃 Досуг": "liesure",
    "💸 Перевод": "transfer",
    "💱 Инвестиции": "investments",
};
Finance.specialFinances = ['transfer', 'investments'];
const finance = new Finance(PrismaSingleton_1.default, {
    dateHelper: DateHelper_1.default,
    rate: Rate_1.default,
    currency: Currency_1.currency,
});
exports.default = finance;
