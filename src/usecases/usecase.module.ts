import { Module } from '@nestjs/common';
import { CreateUserUsecase } from './user/create/create-user.usecase';
import { FindUserUsecase } from './user/find-by-id/find-user.usecase';
import { LoginUserUsecase } from './user/login/login-user.usecase';
import { RefreshAuthTokenUserUsecase } from './user/refresh-auth-token/refresh-auth-token-user.usecase';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { CreateEventUseCase } from './event/create/create-event.usecase';
import { CreateRegionUseCase } from './region/create/create-region.usecase';
import { FindAllRegionNamesUsecase } from './region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllPaginatedUsersUsecase } from './user/find-all-paginated/find-all-paginated.usecase';

@Module({
  imports: [DataBaseModule, ServiceModule],
  providers: [
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    CreateEventUseCase,
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedUsersUsecase,
  ],
  exports: [
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    CreateEventUseCase,
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedUsersUsecase,
  ],
})
export class UsecaseModule {}
