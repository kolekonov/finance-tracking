import finance from "./Finance";
import rate from "./Rate";

export class Reply {
    static async successReply(savedData: Record<string, any>) {
        const rateObj = await rate.getRate();
        const typeName = finance.getFinanceTypeName(savedData.type);
        const desc = savedData.desc ? savedData.desc : 'Описание на задано';
        return `*Запись добавлена* \n Тип: ${typeName} \n Сумма: ${savedData.value} \n Описание: ${desc} \n Курс: ${rateObj?.rate}`;
    }
}