import { Bot } from "grammy";
import message from "./classes/Message";
import config from "./config/config";
import rate from "./classes/Rate";
import finance from "./classes/Finance";

const token = config.getToken();

if (!token) {
  throw new Error("Проблемы с токеном");
}

const bot = new Bot(token);

const keyboard = config.setKeybord();

// Устанавливаем доступные команды
bot.api.setMyCommands([
  { command: "set_current_rate", description: "Установить курс" },
  { command: "get_current_rate", description: "Текущий курс" },
  { command: "get_statistics_for_month", description: "Траты за месяц" },
  { command: "get_statistics_for_all", description: "Траты за все время" },
]);

// Зафиксировать курс
bot.command("set_current_rate", async (ctx) => {
  ctx.reply("Укажите текущий курс");
  if (ctx.message?.text) {
    message.setLastMessage(ctx.message?.text);
  }
});

// Получить текущий курс
bot.command("get_current_rate", async (ctx) => {
  const currentRate = await rate.getRate();
  await ctx.reply(`Текущий курс - ${currentRate?.rate}`);
});

// Получить статистику за месяц
bot.command("get_statistics_for_month", async (ctx) => {
  const mdString = await finance.showMonthlyExpensesAsMdString();

  ctx.reply(mdString, {
    parse_mode: "MarkdownV2",
  });
});

// Получить статистику за все время
bot.command("get_statistics_for_all", async (ctx) => {
  const mdString = await finance.showAllExpensesAsMdString();

  ctx.reply(mdString, {
    parse_mode: "MarkdownV2",
  });
});

// Главный поток сообщений
bot.on("message", async (ctx) => {
  const currentMessage = ctx.message.text;

  if (!currentMessage) {
    return;
  }

  await message.getLastMessageFromDb();

  // Устанавливаем курс
  if (message.getLastMessage() === "/set_current_rate") {
    const rateValue = currentMessage.match(/[0-9]+(\.[0-9]+)?/g);
    let setRate: any;

    if (rateValue && rateValue[0]) {
      setRate = await rate.setRate(parseFloat(rateValue[0]));
    }

    if (setRate && setRate.rate) {
      await ctx.reply(`Установлен новый курс - ${setRate.rate}`);
    } else {
      await ctx.reply("Ошибка");
    }

    message.setLastMessage(currentMessage);

    return;
  }

  // Обработка расхода
  if (finance.checkFinanceTypes(currentMessage)) {
    let reply = "✅";

    const processedMessage = message.processingMessage(
      message.getLastMessage()
    );

    const savedFinance =
      processedMessage.data &&
      (await finance.saveToDb({
        ...processedMessage.data,
        type: finance.getFinanceTypeCode(currentMessage),
      }));

    if (!savedFinance?.id) {
      reply = "😡";
    }

    await ctx.reply(reply);
  } else {
    message.setLastMessage(currentMessage);
    await ctx.reply("Выберите тип", {
      reply_markup: keyboard,
    });
  }

  //Фиксируем последнее сообщение
  if (currentMessage) {
    message.setLastMessage(currentMessage);
  }
});

bot.start();
