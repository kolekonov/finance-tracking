import prisma from "./PrismaSingleton";
import { PrismaClient } from "@prisma/client";

interface IUser {
    telegramId: number;
    name?: string;
}

class User {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createUser(user: IUser) {
        try {
            const newUser = await this.prisma.user.create({
                data: user
            });
            return newUser;
        } catch (e: any) {
            console.log(e.message)
        }
    }

    async getUserByTelegramId(id: number) {
        console.log(id, 'id')
        const user = await this.prisma.user.findFirst({
            where: {
                telegramId: id
            }
        })
        return user;
    }
}

export const user = new User(prisma);