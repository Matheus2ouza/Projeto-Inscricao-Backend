import { Module } from '@nestjs/common';
import { RedisServiceProvider } from './redis.service.provider';

@Module({
  providers: [RedisServiceProvider],
  exports: [RedisServiceProvider],
})
export class RedisModule {}
