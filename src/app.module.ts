import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import appConfig from './config/app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { SpendModule } from './spend/spend.module';
import * as LocalSession from 'telegraf-session-local';
import { MiddlewareModule } from './middlewares/middleware.module';

// const localSession = new LocalSession({ database: 'session_db.json' });


/*
  Type 'typeof XxxClass' is not assignable to type 'Middleware<any>'
  Bất cứ khi nào thư viện bên thứ 3 nhận Middleware dạng function mà mình lại muốn dùng NestJS Injectable class → phải:

  Inject instance qua inject: [AuthMiddleware]
  Wrap method thành arrow function trước khi truyền vào
  Thấy typeof XxxClass trong lỗi = đang truyền class thay vì instance.
 */

@Module({
  imports: [
    MiddlewareModule,
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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('config.telegraf.token') || '',
      }),
    }),
    BotModule,
    SpendModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
