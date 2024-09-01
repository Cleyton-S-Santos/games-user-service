import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisProvider {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setValue(key: string, value: string, ttlInSeconds: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlInSeconds);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async delValue(key: string): Promise<any> {
    return this.redis.del(key)
  }
}
