import { Module } from '@nestjs/common';
import { SpendService } from './spend.service';
import { SpendController } from './spend.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpendController],
  providers: [SpendService],
})
export class SpendModule { }
