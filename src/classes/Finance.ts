import dateHelper from "./DateHelper";
import rate from "./Rate";
import prisma from "./PrismaSingleton";
import { Prisma, PrismaClient } from "@prisma/client";
import { currency, Currency } from "./Currency";

interface IFinance {
  price: number;
  desc?: string | null;
  type: string;
  user?: number;
  transfer?: number;
  investments?: number;
}

class Finance {
  private prisma: PrismaClient;
  private static dateHelper: any;
  private static financeTypes: string[] = [];
  private currency: Currency;
  private rate: any;
  private static financeTypesMap: Record<string, string> = {
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

  private static specialFinances: string[] = ['transfer', 'investments'];

  constructor(prisma: PrismaClient, dependencies: Record<string, any>) {
    this.prisma = prisma;
    this.rate = dependencies.rate;
    this.currency = dependencies.currency;
    Finance.dateHelper = dependencies.dateHelper;
    Finance.fillFinanceTypeArray();
  }

  private static fillFinanceTypeArray() {
    for (const type in Finance.financeTypesMap) {
      Finance.financeTypes.push(type);
    }
  }

  getFinanceTypeName(englishName: string) {
    let neededName = '';

    for (const key in Finance.financeTypesMap) {
      if (englishName === Finance.financeTypesMap[key]) {
        neededName = key;
        break;
      }
    }

    return neededName;
  }

  async saveToDb({ price, desc, type, user, transfer, investments }: IFinance) {
    const currentRateObj = await this.rate.getRate();
    const currentRate = currentRateObj?.rate ? currentRateObj?.rate : 1;

    return await this.prisma.finance.create({
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
  }

  // Временный метод 
  async getAllRows() {
    const finances = await this.prisma.finance.findMany();

    for (const row of finances) {

      const update = await this.prisma.finance.update({
        where: {
          id: row.id,
        },
        data: {
          user: 1
        }
      })
      console.log(update)
    }

  }

  async removeById(id: number) {
    return await this.prisma.finance.delete({
      where: {
        id: id,
      }
    });
  }

  async removeLastRow() {
    const lastRow = await this.prisma.finance.findFirst({
      orderBy: {
        id: "desc",
      }
    });

    if (lastRow?.id) {
      return await this.removeById(lastRow.id);
    }

    return false;
  }

  checkFinanceTypes(type: string): boolean {
    if (Finance.financeTypes.includes(type)) {
      return true;
    }

    return false;
  }

  getFinanceTypeCode(type: string): string {
    return Finance.financeTypesMap[type]
      ? Finance.financeTypesMap[type]
      : "unknown";
  }

  getFinanceTypesArray(): string[] {
    return Finance.financeTypes;
  }

  private static prepareExpensesResultObject(list: Record<string, any>[]) {
    const result: Record<string, any> = {};

    list.forEach((item) => {
      let price = item.value;

      if (Finance.specialFinances.includes(item.type)) {
        price = item[item.type];
      }

      if (result[item.type]) {
        result[item.type] += price;
      } else {
        result[item.type] = price;
      }

    });

    return result;
  }

  static getSpecialExpenses(rawExpenses: Record<string, any>) {
    let sum = 0;

    for (const key in rawExpenses) {
      if (!Finance.specialFinances.includes(key)) {
        continue;
      }

      sum += rawExpenses[key];
    }

    return sum;
  }

  private static prepareExpensesMdString(rawExpenses: Record<string, any>) {
    let res = "";
    let realType: string = "unknown";
    let sum: number = 0;

    for (const key in rawExpenses) {
      sum += rawExpenses[key];
      for (const financeKey in Finance.financeTypesMap) {
        if (Finance.financeTypesMap[financeKey] === key) {
          realType = financeKey;
        }
      }

      res += `${realType} : ${currency.formatCurrency(rawExpenses[key])} \n`;
    }

    const specialExpenses = Finance.getSpecialExpenses(rawExpenses);

    res += `\nВсего потрачено: *${currency.formatCurrency(sum)}*`;
    res += `\n\n ▶️ Особенные траты: *${currency.formatCurrency(specialExpenses)}*`;
    res += `\n ▶️ Безвозратно потрачено : *${currency.formatCurrency(sum - specialExpenses)}*`;

    return res;
  }


  async getMonthlyExpenses(userId: number): Promise<Record<string, any>> {
    const queryObject: Prisma.FinanceFindManyArgs = {
      where: {
        createAt: {
          gte: Finance.dateHelper.getFirstDayInMonth(),
          lte: Finance.dateHelper.getLastDayInMonth(),
        },
      },
    }

    if (userId !== 0) {
      if (!queryObject.where) {
        queryObject.where = {};
      }

      queryObject.where['user'] = userId;
    }

    const expensesList = await prisma.finance.findMany(queryObject);

    return Finance.prepareExpensesResultObject(expensesList);
  }

  async getAllExpenses(userId: number) {
    const queryObject: Prisma.FinanceFindManyArgs = {};

    if (userId !== 0) {
      if (!queryObject.where) {
        queryObject.where = {};
      }

      queryObject.where['user'] = userId;
    }

    const expensesList = await prisma.finance.findMany(
      queryObject
    );

    return Finance.prepareExpensesResultObject(expensesList);
  }

  async showMonthlyExpensesAsMdString(userId: number) {
    const rawExpenses = await this.getMonthlyExpenses(userId);
    let mdString = "*Траты за месяц* \n\n";

    mdString += Finance.prepareExpensesMdString(rawExpenses);

    return mdString;
  }


  async showAllExpensesAsMdString(userId: number) {
    const rawExpenses = await this.getAllExpenses(userId);
    let mdString = "*Траты за все время* \n\n";

    mdString += Finance.prepareExpensesMdString(rawExpenses);

    return mdString;
  }
}

const finance = new Finance(prisma, {
  dateHelper: dateHelper,
  rate: rate,
  currency: currency,
});
export default finance;
