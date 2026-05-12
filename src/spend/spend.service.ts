import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpendService {
  constructor(private readonly prisma: PrismaService) { }

  async deleteSpend(id: string, userId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const record = await tx.transaction.findUnique({
        where: { id }
      })

      if (!record || record.userId !== userId) {
        throw new Error('Transaction does not exist or you do not have permission to delete it.');
      }

      await tx.transaction.delete({
        where: { id }
      })

      await tx.wallet.update({
        where: {
          id: record.walletId,
        },
        data: {
          balance: {
            increment: record.amount
          }
        }
      })

      return record;
    })
  }
}
