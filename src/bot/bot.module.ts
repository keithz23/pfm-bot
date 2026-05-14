import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { BotUpdate } from './bot.update';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpendModule } from 'src/spend/spend.module';
import { SpendService } from 'src/spend/spend.service';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { LoggerMiddleware } from 'src/middlewares/logger.middleware';
import { AuthMiddleware } from 'src/middlewares/logger-auth.middleware';
import { MiddlewareModule } from 'src/middlewares/middleware.module';

@Module({
  imports: [PrismaModule, SpendModule, MiddlewareModule],
  controllers: [BotController],
  providers: [BotService, BotUpdate, SpendService],
})
export class BotModule {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly loggerMiddleware: LoggerMiddleware,
    private readonly authMiddleware: AuthMiddleware,
  ) {
    this.bot.use((ctx, next) => loggerMiddleware.use(ctx, next));
    this.bot.use((ctx, next) => authMiddleware.use(ctx, next));
  }
}
