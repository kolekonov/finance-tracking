import "dotenv/config";
import {Bot, Keyboard} from "grammy";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

const token = process.env.TG_BOT_TOKEN;

if(!token) {
    throw new Error('Проблемы с токеном');
}

const bot = new Bot(token);

const keyboard = new Keyboard()
    .text("🍇 Еда")
    .text("🍴 Кафе")
    .resized();

const messages: number[] = [];

bot.on("message", async (ctx) => {

    if(ctx.message.text === "🍇 Еда") {
        const value = messages.at(-1);

        if(value) {
            const row = await prisma.finance.create({
                data: {
                    type: 'food',
                    value: value,
                }
            })

            if(row && row.id) {
                await ctx.reply('Добавлено', {
                    reply_markup: {
                        remove_keyboard: true
                    },
                });
            }
        }
    } else {
        const value = Number(ctx.message.text);

        if(value && !isNaN(value)) {
            messages.push(value);

            await ctx.reply('Выберите тип', {
                reply_markup: keyboard,
            });
        } else {
            await ctx.reply('Укажите число', {
                reply_markup: {remove_keyboard: true},
            });
        }
    }
});

bot.start();




