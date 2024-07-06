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
  };

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

  async saveToDb({ price, desc, type, user }: IFinance) {
    const currentRateObj = await this.rate.getRate();
    const currentRate = currentRateObj?.rate ? currentRateObj?.rate : 1;
    console.log(user)
    return await this.prisma.finance.create({
      data: {
        value: price * currentRate,
        desc: desc,
        type: type,
        createAt: new Date(),
        rate: currentRate,
        flag: process.env.ENVIRONMENT,
        user: user,
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
      if (result[item.type]) {
        result[item.type] += item.value;
      } else {
        result[item.type] = item.value;
      }
    });

    return result;
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

    res += `\nВсего за месяц потрачено: *${currency.formatCurrency(sum)}*`;

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
