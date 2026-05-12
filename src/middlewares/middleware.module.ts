import { Module } from '@nestjs/common';
import { AuthMiddleware } from './logger-auth.middleware';
import { LoggerMiddleware } from './logger.middleware';

@Module({
    providers: [AuthMiddleware, LoggerMiddleware],
    exports: [AuthMiddleware, LoggerMiddleware],
})
export class MiddlewareModule { }