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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const grammy_1 = require("grammy");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const token = process.env.TG_BOT_TOKEN;
if (!token) {
    throw new Error('Проблемы с токеном');
}
const bot = new grammy_1.Bot(token);
const inlineKeyBoard = new grammy_1.InlineKeyboard();
inlineKeyBoard
    .text('🍇 Еда', 'food')
    .text('🍴 Кафе', 'restaurant');
let message;
bot.command("help", (ctx) => {
    ctx.reply('123');
});
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.message.text) {
        message = ctx.message.text;
    }
    yield ctx.reply('Выберите тип', {
        reply_markup: inlineKeyBoard,
    });
}));
bot.on("callback_query:data", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.callbackQuery.data) {
        const value = Number(message);
        let row = {};
        if (value && !isNaN(value)) {
            row = yield prisma.finance.create({
                data: {
                    type: ctx.callbackQuery.data,
                    value: value,
                }
            });
        }
        if (row && row.id) {
            yield ctx.answerCallbackQuery({
                text: "Добавлено",
            });
        }
        else {
            yield ctx.answerCallbackQuery({
                text: "Ошибка",
            });
        }
        yield ctx.answerCallbackQuery();
    }
}));
bot.start();
