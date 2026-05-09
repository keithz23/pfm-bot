import { Update, Ctx, Start, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  private parseAmount(str: string): number {
    const multiplier = str.toLowerCase().endsWith('k')
      ? 1000
      : str.toLowerCase().endsWith('m')
        ? 1000000
        : 1;
    const value = parseFloat(str.replace(/[km]/gi, ''));
    return isNaN(value) ? 0 : value * multiplier;
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/([_*`[\]])/g, '\\$1');
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const telegramId = ctx.from?.id;
    const name = ctx.from?.first_name || 'Boss';

    if (telegramId) {
      const user = await this.botService.initUserAndWallet(telegramId, name);

      const walletList = user.wallets
        .map(
          (w) => `*${w.name}*: ${Number(w.balance).toLocaleString('vi-VN')} đ`,
        )
        .join('\n');

      const welcomeMsg =
        `Chào mừng *${name}*! Hệ thống quản lý tài chính đã sẵn sàng.\n\n` +
        `*Danh sách ví của bạn:*\n${walletList}\n\n` +
        `*Hướng dẫn sử dụng:*\n` +
        `\`/spend [Số tiền] [Danh mục] [Ví] [Ghi chú]\`\n\n` +
        `*Ví dụ:* \`/spend 50k an_uong bank ăn trưa\``;

      await ctx.reply(welcomeMsg, { parse_mode: 'Markdown' });
    }
  }

  @Command('spend')
  async onSpend(@Ctx() ctx: Context) {
    const text = (ctx.message as any).text;
    const args = text.split(' ').filter(Boolean);

    if (args.length < 3) {
      return ctx.reply(
        `*Sai cú pháp*\n\n` +
          `Cú pháp đúng:\n\`/spend [Số tiền] [Danh mục] [Ví] [Ghi chú]\`\n\n` +
          `Ví dụ: \`/spend 50k an_uong bank an trua\``,
        { parse_mode: 'Markdown' },
      );
    }

    const amount = this.parseAmount(args[1]);
    const category = args[2];
    const walletIdentifier = args[3];
    const note = args.slice(4).join(' ');

    if (amount <= 0) return ctx.reply('Số tiền nhập phải > 0.');

    try {
      const result = await this.botService.logExpense(
        ctx.from!.id,
        amount,
        category,
        walletIdentifier,
        note,
      );

      const safeCategory = this.escapeMarkdown(category.toLowerCase());
      const safeWallet = this.escapeMarkdown(result.walletName);
      const safeNote = this.escapeMarkdown(note || 'N/A');

      const response =
        `*GHI NHẬN THÀNH CÔNG*\n\n` +
        `Số tiền: *${amount.toLocaleString('vi-VN')}* VND\n` +
        `Danh mục: ${safeCategory}\n` +
        `Ví: ${safeWallet}\n` +
        `Ghi chú: ${safeNote}`;

      await ctx.reply(response, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : 'Khi lưu giao dịch';
      await ctx.reply(`Lỗi: ${this.escapeMarkdown(errorMessage)}`, {
        parse_mode: 'Markdown',
      });
    }
  }

  @Command('report')
  async onReport(@Ctx() ctx: Context) {
    try {
      const text = (ctx.message as any).text; // "/report 03/2026"
      const args = text.split(' ').filter(Boolean);

      let month: number | undefined;
      let year: number | undefined;

      if (args.length > 1) {
        const input = args[1]; // "03/2026" or "4"

        if (input.includes('/')) {
          const parts = input.split('/');
          month = parseInt(parts[0]);
          year = parseInt(parts[1]);
        } else {
          month = parseInt(input);
        }
      }

      if (month && (month < 1 || month > 12)) {
        return ctx.reply('Tháng không hợp lệ (1-12).');
      }

      const report = await this.botService.getMonthlyReport(
        ctx.from!.id,
        month,
        year,
      );
      await ctx.reply(report, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(error);
      await ctx.reply('Lỗi hệ thống: Không thể xuất báo cáo.');
    }
  }

  @Command('today')
  async onDailyReport(@Ctx() ctx: Context) {
    try {
      const report = await this.botService.getDailyReport(ctx.from!.id);
      await ctx.reply(report, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(error);
      await ctx.reply('Lỗi: Không thể lấy báo cáo ngày.');
    }
  }
}
