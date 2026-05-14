import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, WalletType } from 'generated/prisma/enums';
import { Decimal } from '@prisma/client/runtime/index-browser';
import dayjs = require('dayjs');
import utc = require('dayjs/plugin/utc');
import timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class BotService {
  constructor(private prisma: PrismaService) { }

  async initUserAndWallet(telegramId: number, name: string) {
    const tId = BigInt(telegramId);

    return await this.prisma.user.upsert({
      where: { telegramId: tId },
      update: { name },
      create: {
        telegramId: tId,
        name: name,
        currency: 'VND',
        wallets: {
          create: [
            {
              name: 'Tiền mặt',
              type: WalletType.CASH,
              balance: 0,
              color: '#4CAF50',
            },
            {
              name: 'Ngân hàng',
              type: WalletType.BANK,
              balance: 0,
              color: '#2196F3',
            },
            {
              name: 'Ví điện tử',
              type: WalletType.E_WALLET,
              balance: 0,
              color: '#FF9800',
            },
          ],
        },
      },
      include: { wallets: true },
    });
  }

  async getUserIdByTelegramId(telegramId: number): Promise<string | null> {
    const tId = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tId },
      select: { id: true },
    });
    return user?.id || null;
  }

  async getWalletById(walletId: string) {
    return await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { id: true, name: true },
    });
  }

  async logExpense(
    telegramId: number,
    amount: number,
    categoryName: string,
    walletIdentifier: string,
    note?: string,
  ) {
    const tId = BigInt(telegramId);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: tId },
      include: { wallets: true },
    });

    if (!user) throw new Error('Không tìm thấy người dùng');

    const wallet =
      user.wallets.find(
        (w) =>
          w.name.toLowerCase() === walletIdentifier.toLowerCase() ||
          w.type.toLowerCase() === walletIdentifier.toLowerCase(),
      ) || user.wallets[0];
    if (!wallet) throw new Error('Không có ví nào khả dụng');

    const normalizedCategory = categoryName.toLowerCase().trim();

    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: normalizedCategory,
          },
        },
        update: {},
        create: {
          name: normalizedCategory,
          userId: user.id,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          categoryId: category.id,
          type: TransactionType.EXPENSE,
          amount: new Decimal(amount),
          transactionDate: new Date(),
          note: note,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      return { transaction, walletName: wallet.name };
    });
  }

  async getDailyReport(telegramId: number) {
    const tId = BigInt(telegramId);

    const timeZone = 'Asia/Ho_Chi_Minh';
    const now = dayjs().tz(timeZone);

    const todayDateOnly = new Date(now.format('YYYY-MM-DD'));

    const user = await this.prisma.user.findUnique({
      where: { telegramId: tId },
      include: { categories: true },
    });

    if (!user) return 'Tài khoản chưa được khởi tạo.';

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: TransactionType.EXPENSE,
        transactionDate: {
          equals: todayDateOnly,
        },
      },
      include: { category: true, wallet: true },
      orderBy: { createdAt: 'desc' },
    });

    const todayStr = now.format('DD/MM/YYYY');

    if (transactions.length === 0) {
      return `*Báo cáo ngày ${todayStr}:*\nBạn chưa ghi nhận khoản chi tiêu nào hôm nay.`;
    }

    const totalDaily = transactions.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    let reportTxt = `*CHI TIÊU HÔM NAY (${todayStr})*\n`;
    reportTxt += `──────────────\n`;

    transactions.forEach((tx) => {
      const timeStr = dayjs(tx.createdAt).tz(timeZone).format('HH:mm');

      const catName = this.escapeMarkdown(tx.category.name);
      const walletName = this.escapeMarkdown(tx.wallet.name);
      const note = tx.note ? ` - _${this.escapeMarkdown(tx.note)}_` : '';

      reportTxt += `• [${timeStr}] *${Number(tx.amount).toLocaleString('vi-VN')}* (${catName} | ${walletName})${note}\n`;
    });

    reportTxt += `──────────────\n`;
    reportTxt += `*TỔNG CỘNG:* *${totalDaily.toLocaleString('vi-VN')}* ${user.currency}`;

    return reportTxt;
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/([_*`[\]])/g, '\\$1');
  }

  async getMonthlyReport(telegramId: number, month?: number, year?: number) {
    const tId = BigInt(telegramId);
    const now = new Date();
    const targetMonth = month ? month - 1 : now.getMonth();
    const targetYear = year || now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: tId },
      include: {
        categories: true,
        wallets: true,
        budgets: { where: { periodMonth: startOfMonth } },
      },
    });

    if (!user) return 'Tài khoản chưa được khởi tạo.';

    const expenses = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: user.id,
        type: TransactionType.EXPENSE,
        transactionDate: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    if (expenses.length === 0)
      return `*Báo cáo tháng ${targetMonth + 1}/${targetYear}:*\nChưa có dữ liệu chi tiêu.`;

    const totalExpense = expenses.reduce(
      (sum, exp) => sum + Number(exp._sum.amount || 0),
      0,
    );
    let reportTxt = `*CHI TIẾT TÀI CHÍNH: THÁNG ${targetMonth + 1}/${targetYear}*\n`;
    reportTxt += `──────────────\n\n*CHI TIÊU THEO MỤC:*\n`;

    expenses.forEach((exp) => {
      const category = user.categories.find((c) => c.id === exp.categoryId);
      const sum = Number(exp._sum.amount || 0);
      const percentage = ((sum / totalExpense) * 100).toFixed(1);
      const safeName = (category?.name || 'Khác').replace(/_/g, '\\_');

      reportTxt += `• ${safeName}: *${sum.toLocaleString('vi-VN')}* (${percentage}%)\n`;
    });

    reportTxt += `\n*TỔNG CHI:* *${totalExpense.toLocaleString('vi-VN')}* ${user.currency}\n`;
    reportTxt += `──────────────\n\n*SỐ DƯ CÁC VÍ:*\n`;

    user.wallets.forEach((w) => {
      reportTxt += `• ${w.name}: *${Number(w.balance).toLocaleString('vi-VN')}* ${user.currency}\n`;
    });

    return reportTxt;
  }
}
