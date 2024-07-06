import { Bot } from "grammy";
import message from "./classes/Message";
import config from "./config/config";
import rate from "./classes/Rate";
import finance from "./classes/Finance";
import { user } from "./classes/User";

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
  { command: "get_statistics_for_month_family", description: "Общие траты за месяц" },
  { command: "get_statistics_for_all", description: "Траты за все время" },
  { command: "get_statistics_for_all_family", description: "Общие траты за все время" },
  { command: "remove_last_row", description: "Удалить последнюю запись" },
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
  let response = 'Пользователь не найдет';

  if (ctx?.from?.id) {
    const currentUser = await user.getUserByTelegramId(ctx.from.id);

    if (currentUser) {
      response = await finance.showMonthlyExpensesAsMdString(currentUser.id)
    }
  }

  ctx.reply(response, {
    parse_mode: "MarkdownV2",
  });
});


// Получить общую статистику за месяц
bot.command("get_statistics_for_month_family", async (ctx) => {
  const response = await finance.showMonthlyExpensesAsMdString(0)

  ctx.reply(response, {
    parse_mode: "MarkdownV2",
  });
});

// Получить статистику за все время
bot.command("get_statistics_for_all", async (ctx) => {
  let response = 'Пользователь не найдет';

  if (ctx?.from?.id) {
    const currentUser = await user.getUserByTelegramId(ctx.from.id);

    if (currentUser) {
      response = await finance.showAllExpensesAsMdString(currentUser.id);
    }
  }

  ctx.reply(response, {
    parse_mode: "MarkdownV2",
  });
});

// Получить общую статистику за все время
bot.command("get_statistics_for_all_family", async (ctx) => {
  const response = await finance.showAllExpensesAsMdString(0);

  ctx.reply(response, {
    parse_mode: "MarkdownV2",
  });
});

// Удалить последнюю запись
bot.command("remove_last_row", async (ctx) => {
  const removeObj = await finance.removeLastRow();
  console.log(removeObj);

  if (!removeObj) {
    ctx.reply("Ошибка при удалении записи");
    return;
  }

  ctx.reply(`Запись \n\n ${removeObj.value}р ${removeObj.desc ? removeObj.desc : ''} \n\n Удалена`, {
    parse_mode: "MarkdownV2",
  });
});

// Главный поток сообщений
bot.on("message", async (ctx) => {
  const currentMessage = ctx.message.text;

  if (!currentMessage || !config.isUserInWhiteList(ctx.from.id)) {
    await ctx.reply("Ваш id отсутствует в белом списке");
    return;
  }

  const currentUser = await user.getUserByTelegramId(ctx.from.id);

  await message.getLastMessageFromDb();

  // Устанавливаем курс
  if (message.getLastMessage() === "/set_current_rate") {
    const rateValue = currentMessage?.match(/[0-9]+(\.[0-9]+)?/g);
    let setRate: any;

    if (rateValue && rateValue[0]) {
      setRate = await rate.setRate(parseFloat(rateValue[0]));
    }

    if (setRate && setRate.rate) {
      await ctx.reply(`Установлен новый курс - ${setRate.rate}`);
    } else {
      await ctx.reply("Ошибка");
    }

    if (currentMessage) {
      message.setLastMessage(currentMessage);
    }

    return;
  }

  // Обработка расхода
  if (currentMessage && finance.checkFinanceTypes(currentMessage)) {
    let reply = "✅";

    const processedMessage = message.processingMessage(
      message.getLastMessage()
    );

    const savedFinance =
      processedMessage.data &&
      (await finance.saveToDb({
        ...processedMessage.data,
        type: finance.getFinanceTypeCode(currentMessage),
        user: currentUser?.id,
      }));

    if (!savedFinance?.id) {
      reply = "😡";
    }

    await ctx.reply(reply);
  } else {
    if (currentMessage) {
      message.setLastMessage(currentMessage);
    }

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
