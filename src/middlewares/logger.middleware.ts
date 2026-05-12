import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class LoggerMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  async use(ctx: Context, next: () => Promise<void>) {
    const start = Date.now();

    await next();

    const ms = Date.now() - start;
    this.logger.log(`Command from @${ctx.from?.username} processed in ${ms}ms`);
  }
}