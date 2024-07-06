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
const grammy_1 = require("grammy");
const Message_1 = __importDefault(require("./classes/Message"));
const config_1 = __importDefault(require("./config/config"));
const Rate_1 = __importDefault(require("./classes/Rate"));
const Finance_1 = __importDefault(require("./classes/Finance"));
const User_1 = require("./classes/User");
const token = config_1.default.getToken();
if (!token) {
    throw new Error("Проблемы с токеном");
}
const bot = new grammy_1.Bot(token);
const keyboard = config_1.default.setKeybord();
// Устанавливаем доступные команды
bot.api.setMyCommands([
    { command: "set_current_rate", description: "Установить курс" },
    { command: "get_current_rate", description: "Текущий курс" },
    { command: "get_statistics_for_month", description: "Траты за месяц" },
    { command: "get_statistics_for_month_family", description: "Общие траты за месяц" },
    { command: "get_statistics_for_all", description: "Траты за все время" },
    { command: "get_statistics_for_all_family", description: "Общие траты за все время" },
    { command: "remove_last_row", description: "Удалить последнюю запись" },
]);
// Зафиксировать курс
bot.command("set_current_rate", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    ctx.reply("Укажите текущий курс");
    if ((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text) {
        Message_1.default.setLastMessage((_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text);
    }
}));
// Получить текущий курс
bot.command("get_current_rate", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const currentRate = yield Rate_1.default.getRate();
    yield ctx.reply(`Текущий курс - ${currentRate === null || currentRate === void 0 ? void 0 : currentRate.rate}`);
}));
// Получить статистику за месяц
bot.command("get_statistics_for_month", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    let response = 'Пользователь не найдет';
    if ((_c = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _c === void 0 ? void 0 : _c.id) {
        const currentUser = yield User_1.user.getUserByTelegramId(ctx.from.id);
        if (currentUser) {
            response = yield Finance_1.default.showMonthlyExpensesAsMdString(currentUser.id);
        }
    }
    ctx.reply(response, {
        parse_mode: "MarkdownV2",
    });
}));
// Получить общую статистику за месяц
bot.command("get_statistics_for_month_family", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield Finance_1.default.showMonthlyExpensesAsMdString(0);
    ctx.reply(response, {
        parse_mode: "MarkdownV2",
    });
}));
// Получить статистику за все время
bot.command("get_statistics_for_all", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let response = 'Пользователь не найдет';
    if ((_d = ctx === null || ctx === void 0 ? void 0 : ctx.from) === null || _d === void 0 ? void 0 : _d.id) {
        const currentUser = yield User_1.user.getUserByTelegramId(ctx.from.id);
        if (currentUser) {
            response = yield Finance_1.default.showAllExpensesAsMdString(currentUser.id);
        }
    }
    ctx.reply(response, {
        parse_mode: "MarkdownV2",
    });
}));
// Получить общую статистику за все время
bot.command("get_statistics_for_all_family", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield Finance_1.default.showAllExpensesAsMdString(0);
    ctx.reply(response, {
        parse_mode: "MarkdownV2",
    });
}));
// Удалить последнюю запись
bot.command("remove_last_row", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const removeObj = yield Finance_1.default.removeLastRow();
    console.log(removeObj);
    if (!removeObj) {
        ctx.reply("Ошибка при удалении записи");
        return;
    }
    ctx.reply(`Запись \n\n ${removeObj.value}р ${removeObj.desc ? removeObj.desc : ''} \n\n Удалена`, {
        parse_mode: "MarkdownV2",
    });
}));
// Главный поток сообщений
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const currentMessage = ctx.message.text;
    if (!currentMessage || !config_1.default.isUserInWhiteList(ctx.from.id)) {
        yield ctx.reply("Ваш id отсутствует в белом списке");
        return;
    }
    const currentUser = yield User_1.user.getUserByTelegramId(ctx.from.id);
    yield Message_1.default.getLastMessageFromDb();
    // Устанавливаем курс
    if (Message_1.default.getLastMessage() === "/set_current_rate") {
        const rateValue = currentMessage === null || currentMessage === void 0 ? void 0 : currentMessage.match(/[0-9]+(\.[0-9]+)?/g);
        let setRate;
        if (rateValue && rateValue[0]) {
            setRate = yield Rate_1.default.setRate(parseFloat(rateValue[0]));
        }
        if (setRate && setRate.rate) {
            yield ctx.reply(`Установлен новый курс - ${setRate.rate}`);
        }
        else {
            yield ctx.reply("Ошибка");
        }
        if (currentMessage) {
            Message_1.default.setLastMessage(currentMessage);
        }
        return;
    }
    // Обработка расхода
    if (currentMessage && Finance_1.default.checkFinanceTypes(currentMessage)) {
        let reply = "✅";
        const processedMessage = Message_1.default.processingMessage(Message_1.default.getLastMessage());
        const savedFinance = processedMessage.data &&
            (yield Finance_1.default.saveToDb(Object.assign(Object.assign({}, processedMessage.data), { type: Finance_1.default.getFinanceTypeCode(currentMessage), user: currentUser === null || currentUser === void 0 ? void 0 : currentUser.id })));
        if (!(savedFinance === null || savedFinance === void 0 ? void 0 : savedFinance.id)) {
            reply = "😡";
        }
        yield ctx.reply(reply);
    }
    else {
        if (currentMessage) {
            Message_1.default.setLastMessage(currentMessage);
        }
        yield ctx.reply("Выберите тип", {
            reply_markup: keyboard,
        });
    }
    //Фиксируем последнее сообщение
    if (currentMessage) {
        Message_1.default.setLastMessage(currentMessage);
    }
}));
bot.start();
