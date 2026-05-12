import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context } from 'telegraf';

@Injectable()
export class AuthMiddleware {
  private readonly myChatId: string;
  private logger = new Logger(AuthMiddleware.name)

  constructor(private readonly configService: ConfigService) {
    this.myChatId = this.configService.get<string>('config.telegraf.chatId') || ''
  }

  use(ctx: Context, next: () => Promise<void>) {
    if (ctx.from?.id === Number(this.myChatId)) {
      return next();
    }
    this.logger.warn(`Unauthorized access attempt by @${ctx.from?.username}`);
  }
}