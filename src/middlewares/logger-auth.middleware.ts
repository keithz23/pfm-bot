import { Context } from 'telegraf';

const MY_CHAT_ID = 6076383119;

export const AuthMiddleware = async (
  ctx: Context,
  next: () => Promise<void>,
) => {
  if (ctx.from?.id === MY_CHAT_ID) {
    await next();
  } else {
    console.log(`[Warning] Ai đó đang cố dùng bot: ${ctx.from?.username}`);
  }
};
