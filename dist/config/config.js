"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
require("dotenv/config");
const grammy_1 = require("grammy");
const Finance_1 = __importDefault(require("../classes/Finance"));
class Config {
    constructor(props) {
        Config.keyboardTypes = props.keyboardTypes;
        Config.financeTypes = props.financeTypes;
    }
    getToken() {
        return Config.token;
    }
    isUserInWhiteList(userId) {
        return Config.usersWhiteList.includes(userId);
    }
    setKeybord() {
        const keyboard = Config.keyboardTypes;
        let index = 0;
        Config.financeTypes.forEach((type) => {
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
exports.Config = Config;
Config.token = process.env.TG_BOT_TOKEN;
Config.usersWhiteList = [
    473181479, 2109088810
];
const config = new Config({
    keyboardTypes: new grammy_1.Keyboard(),
    financeTypes: Finance_1.default.getFinanceTypesArray(),
});
exports.default = config;
