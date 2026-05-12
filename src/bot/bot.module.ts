import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { BotUpdate } from './bot.update';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SpendModule } from 'src/spend/spend.module';
import { SpendService } from 'src/spend/spend.service';

@Module({
  imports: [PrismaModule, SpendModule],
  controllers: [BotController],
  providers: [BotService, BotUpdate, SpendService],
})
export class BotModule { }
