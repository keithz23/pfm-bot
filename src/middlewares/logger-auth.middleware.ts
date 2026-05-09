import { Context } from 'telegraf';

const MY_CHAT_ID = 6076383119;

export const AuthMiddleware = async (
  ctx: Context,
  next: () => Promise<void>,
) => {
  // Nếu là bạn -> Cho đi tiếp
  if (ctx.from?.id === MY_CHAT_ID) {
    await next();
  } else {
    // Nếu là người lạ -> Chặn lại và có thể gửi cảnh báo
    console.log(`[CẢNH BÁO] Ai đó đang cố dùng bot: ${ctx.from?.username}`);
    // KHÔNG gọi next() ở đây -> Luồng bị ngắt
  }
};
