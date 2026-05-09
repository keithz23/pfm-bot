import { Context } from 'telegraf';

export const LoggerMiddleware = async (
  ctx: Context,
  next: () => Promise<void>,
) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  console.log(`Lệnh từ ${ctx.from?.username} xử lý mất ${ms}ms`);
};
