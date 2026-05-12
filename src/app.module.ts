import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import appConfig from './config/app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AuthMiddleware } from './middlewares/logger-auth.middleware';
import { BotModule } from './bot/bot.module';
import { SpendModule } from './spend/spend.module';
import * as LocalSession from 'telegraf-session-local';

// const localSession = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.production'],
      load: [appConfig],
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('config.telegraf.token') || '',

        middlewares: [
          LoggerMiddleware,
          AuthMiddleware,
          // localSession.middleware(),
        ],
      }),
    }),
    BotModule,
    SpendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
