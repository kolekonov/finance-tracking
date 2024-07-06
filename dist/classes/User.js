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
exports.user = void 0;
const PrismaSingleton_1 = __importDefault(require("./PrismaSingleton"));
class User {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = yield this.prisma.user.create({
                    data: user
                });
                return newUser;
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    getUserByTelegramId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(id, 'id');
            const user = yield this.prisma.user.findFirst({
                where: {
                    telegramId: id
                }
            });
            return user;
        });
    }
}
exports.user = new User(PrismaSingleton_1.default);
