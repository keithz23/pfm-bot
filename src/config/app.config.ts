import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  telegraf: {
    token: process.env.TELEGRAF_TOKEN,
    chatId:process.env.TELEGRAF_CHAT_ID
  },
}));
