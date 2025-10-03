import { Module } from '@nestjs/common';
import { jsonWebTokenJwtServiceProvider } from './jwt/jsonwebtoken/jsonwebtoken.jwt.service.provider';
import { DataBaseModule } from '../repositories/database.module';

@Module({
  imports: [DataBaseModule],
  providers: [jsonWebTokenJwtServiceProvider],
  exports: [jsonWebTokenJwtServiceProvider],
})
export class ServiceModule {}
