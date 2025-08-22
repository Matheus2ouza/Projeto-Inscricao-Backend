import { Module } from "@nestjs/common";
import { CreateLocalityUsecase } from "./locality/create/create-locality.usecase";
import { FindLocalityUsecase } from "./locality/find-by-id/find-locality.usecase";
import { LoginLocalityUsecase } from "./locality/login/login-locality.usecase";
import { RefreshAuthTokenLocalityUsecase } from "./locality/refresh-auth-token/refresh-auth-token-locality.usecase";
import { DataBaseModule } from "src/infra/repositories/database.module";
import { ServiceModule } from "src/infra/services/service.module";

@Module({
  imports: [DataBaseModule, ServiceModule],
  providers: [
    CreateLocalityUsecase, 
    FindLocalityUsecase, 
    LoginLocalityUsecase, 
    RefreshAuthTokenLocalityUsecase
  ],
  exports: [
    CreateLocalityUsecase, 
    FindLocalityUsecase, 
    LoginLocalityUsecase, 
    RefreshAuthTokenLocalityUsecase
  ]
})
export class UsecaseModule {}