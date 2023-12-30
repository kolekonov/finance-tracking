import prisma from "./PrismaSingleton";
import { PrismaClient } from "@prisma/client";

class Rate {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async setRate(rate: number) {
    const rateRes = await this.getRate();
    let createData: any;

    if (rateRes && rateRes.id) {
      createData = await this.prisma.rate.update({
        data: {
          rate: rate,
        },
        where: {
          id: rateRes.id,
        },
      });
    } else {
      createData = await this.prisma.rate.create({
        data: {
          rate: rate,
        },
      });
    }

    return createData;
  }

  async getRate() {
    const res = await this.prisma.rate.findFirst();
    return res;
  }
}

const rate = new Rate(prisma);
export default rate;
