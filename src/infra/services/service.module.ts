import { Module } from '@nestjs/common';
import { jsonWebTokenJwtServiceProvider } from './jwt/jsonwebtoken/jsonwebtoken.jwt.service.provider';
import { DataBaseModule } from '../repositories/database.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [DataBaseModule, RedisModule],
  providers: [jsonWebTokenJwtServiceProvider],
  exports: [jsonWebTokenJwtServiceProvider, RedisModule],
})
export class ServiceModule {}
