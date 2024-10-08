import "dotenv/config";
import { Keyboard } from "grammy";
import finance from "../classes/Finance";

export class Config {
  static token = process.env.TG_BOT_TOKEN;
  private static keyboardTypes: any;
  private static financeTypes: any;
  private static usersWhiteList: number[] = [
    473181479, 2109088810
  ];

  constructor(props: any) {
    Config.keyboardTypes = props.keyboardTypes;
    Config.financeTypes = props.financeTypes;
  }

  getToken() {
    return Config.token;
  }

  isUserInWhiteList(userId: number): boolean {
    return Config.usersWhiteList.includes(userId);
  }

  setKeybord() {
    const keyboard = Config.keyboardTypes;
    let index = 0;

    Config.financeTypes.forEach((type: string) => {
      index++;
      keyboard.text(type);

      if (index !== 0 && index % 3 === 0) {
        keyboard.row();
      }
    });

    keyboard.resized();

    return keyboard;
  }
}

const config = new Config({
  keyboardTypes: new Keyboard(),
  financeTypes: finance.getFinanceTypesArray(),
});


export default config;
