import prisma from "./PrismaSingleton";
import { PrismaClient } from "@prisma/client";

interface ISaveToDb {
  tgMessageId: number;
  value: string;
}

export interface IProcessedMessage {
  price: number;
  desc?: string | null;
}

interface IProcessedResult {
  data?: IProcessedMessage;
  error?: Record<string, any>
}

export class Message {
  private prisma: PrismaClient;
  private lastMessage: string = "";

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async saveToDb({ tgMessageId, value }: ISaveToDb) {
    return await this.prisma.message.create({
      data: {
        tgMessageId: tgMessageId,
        value: value,
      },
    });
  }

  setLastMessage(message: string) {
    this.lastMessage = message;
  }

  getLastMessage() {
    return this.lastMessage;
  }

  async getLastMessageFromDb() {
    const kek = await this.prisma.message.findFirst({
      orderBy: {
        id: 'desc',
      },
    })
  }

  processingMessage(message: string): IProcessedResult {
    const splitMessage = message.split('-');
    const price = Number(splitMessage[0]);
    const result: IProcessedResult = {};

    if (isNaN(price)) {
      result.error = {
        message: "Стоимость не число",
      }
    }

    result.data = {
      price: price,
      desc: splitMessage[1] ? splitMessage[1] : null,
    }

    return result;
  }
}

const message = new Message(prisma);
export default message;
