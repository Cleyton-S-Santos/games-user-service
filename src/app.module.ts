import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './auth/user.module';
import {databaseProviders} from "./config/database.providers"
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisProvider } from './config/redis.provider';
import { config } from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configValues from "./config/configService"

config()
@Module({
  imports: [UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configValues] 
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        username: configService.get<string>('REDIS_USERNAME'),
        password: configService.get<string>('REDIS_PASSWORD'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ...databaseProviders, RedisProvider],
})
export class AppModule {}
