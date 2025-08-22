import { Module } from "@nestjs/common";
import { jsonWebTokenJwtServiceProvider } from "./jwt/jsonwebtoken/jsonwebtoken.jwt.service.provider";

@Module({
  providers: [jsonWebTokenJwtServiceProvider],
  exports: [jsonWebTokenJwtServiceProvider]
})
export class ServiceModule {}
