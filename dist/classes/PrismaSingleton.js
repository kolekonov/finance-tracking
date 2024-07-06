"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class PrismaSingleton {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    static getInstance() {
        if (!PrismaSingleton.instance) {
            PrismaSingleton.instance = new PrismaSingleton();
        }
        return PrismaSingleton.instance;
    }
    getPrisma() {
        return this.prisma;
    }
}
const prismaSingleton = PrismaSingleton.getInstance();
const prisma = prismaSingleton.getPrisma();
exports.default = prisma;
