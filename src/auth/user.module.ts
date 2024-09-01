import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { databaseProviders } from 'src/config/database.providers';
import { userProviders } from './repository/user.providers';
import { JwtModule } from '@nestjs/jwt';
import { RedisProvider } from 'src/config/redis.provider';

@Module({
  controllers: [UserController],
  providers: [UserService, ...userProviders, ...databaseProviders, RedisProvider],
  imports: [
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '60s' },
    }),
  ]
})
export class UserModule {}
