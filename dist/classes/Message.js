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
exports.Message = void 0;
const PrismaSingleton_1 = __importDefault(require("./PrismaSingleton"));
class Message {
    constructor(prisma) {
        this.lastMessage = "";
        this.prisma = prisma;
    }
    saveToDb({ tgMessageId, value }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.message.create({
                data: {
                    tgMessageId: tgMessageId,
                    value: value,
                },
            });
        });
    }
    setLastMessage(message) {
        this.lastMessage = message;
    }
    getLastMessage() {
        return this.lastMessage;
    }
    getLastMessageFromDb() {
        return __awaiter(this, void 0, void 0, function* () {
            const kek = yield this.prisma.message.findFirst({
                orderBy: {
                    id: 'desc',
                },
            });
        });
    }
    processingMessage(message) {
        const splitMessage = message.split('-');
        const price = Number(splitMessage[0]);
        const result = {};
        if (isNaN(price)) {
            result.error = {
                message: "Стоимость не число",
            };
        }
        result.data = {
            price: price,
            desc: splitMessage[1] ? splitMessage[1] : null,
        };
        return result;
    }
}
exports.Message = Message;
const message = new Message(PrismaSingleton_1.default);
exports.default = message;
