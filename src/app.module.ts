import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './auth/user.module';
import {databaseProviders} from "./config/database.providers"
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisProvider } from './config/redis.provider';
import { config } from 'dotenv';
import { APP_GUARD } from '@nestjs/core';
import { AccessMiddleware } from './config/ApiToken.security';

config()
@Module({
  imports: [UserModule,
    RedisModule.forRoot({
      options: {
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        host: process.env.REDIS_HOST, 
        port: Number(process.env.REDIS_PORT),
      },
      type: 'single'
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ...databaseProviders, RedisProvider],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // Aplica para todas as rotas
  }
}
