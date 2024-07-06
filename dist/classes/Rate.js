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
const PrismaSingleton_1 = __importDefault(require("./PrismaSingleton"));
class Rate {
    constructor(prisma) {
        this.prisma = prisma;
    }
    setRate(rate) {
        return __awaiter(this, void 0, void 0, function* () {
            const rateRes = yield this.getRate();
            let createData;
            if (rateRes && rateRes.id) {
                createData = yield this.prisma.rate.update({
                    data: {
                        rate: rate,
                    },
                    where: {
                        id: rateRes.id,
                    },
                });
            }
            else {
                createData = yield this.prisma.rate.create({
                    data: {
                        rate: rate,
                    },
                });
            }
            return createData;
        });
    }
    getRate() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.prisma.rate.findFirst();
            return res;
        });
    }
}
const rate = new Rate(PrismaSingleton_1.default);
exports.default = rate;
