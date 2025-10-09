import { UserNotAllowedToCreateUserUsecaseExceptionFilterProvider } from './filters/usecases/user-not-allowed-to-create-user-usecase-exception.filter';
import { Module } from '@nestjs/common';
import { CreateUserRoute } from './routes/user/create/create-user.route';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { WelcomeRoute } from './routes/welcome.route';
import { ValidatorDomainExceptionFilterProvider } from './filters/domain/validator-domain-exception.filter';
import { DomainExceptionFilterProvider } from './filters/domain/domain-exception.filter';
import { UsecaseExceptionFilterProvider } from './filters/usecases/usecase-exception.filter';
import { CredentialsNotValidUsecaseExcepitonFilterProvider } from './filters/usecases/credentials-not-valid-usecase-exception.filter';
import { UserAlreadyExistsUsecaseExceptionFilterProvider } from './filters/usecases/user-already-exist-usecase-exception.filter';
import { UserNotFoundUsecaseExceptionFilterProvider } from './filters/usecases/user-not-found-usecase-exception.filter';
import { ServiceExceptionFilterProvider } from './filters/infra/service/server-exception.filter';
import { RefreshTokenNotValidServiceExceptionFilterProvider } from './filters/infra/service/refresh-token-not-valid-service-exception.filter';
import { AuthTokenNotValidServiceExceptionFilterProvider } from './filters/infra/service/auth-token-not-valid-service-exception.filter';
import { LoginUserRoute } from './routes/user/login/login-user.route';
import { RefreshAuthTokenRoute } from './routes/user/refresh-auth-token/refresh-auth-token.route';
import { FindByIdUserRoute } from './routes/user/find-by-id/find-by-id-user.route';
import { UserProfileRoute } from './routes/user/profile/user-profile.route';
import { AuthGuardProvider } from './authenticator/guards/auth.guard';
import { RoleGuardProvider } from './authenticator/guards/role.guard';
import { ServiceModule } from '../services/service.module';
import { CreateEventRoute } from './routes/event/create/create-event.route';
import { CreateRegionRoute } from './routes/region/create/create-region.route';
import { FindAllRegionsRoute } from './routes/region/findAllRegionNames/find-all-region-names.route';
import { FindAllPaginatedUsersRoute } from './routes/user/find-all-paginated/find-all-paginated-users.route';
import { UploadEventImageRoute } from './routes/event/upload-image/upload-event-image.route';
import { FindAllPaginatedRegionsRoute } from './routes/region/find-all-paginated/find-all-paginated-regions.route';
import { FindAllPaginatedEventsRoute } from './routes/event/find-all-paginated/find-all-paginated-events.route';
import { FindByIdEventRoute } from './routes/event/find-by-id/find-by-id.route';
import { CreateTypeInscriptionRoute } from './routes/typeInscription/create/create-type-inscription.route';
import { FindByEventId } from './routes/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.route';
import { GroupUploadRoute } from './routes/inscription/inscriptionGroup/upload/group-upload.route';
import { GroupConfirmRoute } from './routes/inscription/inscriptionGroup/confirm/group-confirm.route';
import { GroupFindCacheRoute } from './routes/inscription/inscriptionGroup/find-cache/group-find-cache.route';
import { FindAllInscriptionRoute } from './routes/typeInscription/find-all-inscriptionDescriptions/find-all-type-inscription.route';

@Module({
  imports: [ServiceModule, UsecaseModule],
  controllers: [
    WelcomeRoute,
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
    UserProfileRoute,
    CreateEventRoute,
    FindAllPaginatedEventsRoute,
    CreateRegionRoute,
    FindAllRegionsRoute,
    FindAllPaginatedRegionsRoute,
    FindAllPaginatedUsersRoute,
    UploadEventImageRoute,
    FindByIdEventRoute,
    CreateTypeInscriptionRoute,
    FindByEventId,
    GroupUploadRoute,
    GroupConfirmRoute,
    GroupFindCacheRoute,
    FindAllInscriptionRoute,
  ],
  providers: [
    AuthGuardProvider,
    RoleGuardProvider,
    ValidatorDomainExceptionFilterProvider,
    DomainExceptionFilterProvider,
    UsecaseExceptionFilterProvider,
    CredentialsNotValidUsecaseExcepitonFilterProvider,
    UserAlreadyExistsUsecaseExceptionFilterProvider,
    UserNotFoundUsecaseExceptionFilterProvider,
    UserNotAllowedToCreateUserUsecaseExceptionFilterProvider,
    AuthTokenNotValidServiceExceptionFilterProvider,
    ServiceExceptionFilterProvider,
    RefreshTokenNotValidServiceExceptionFilterProvider,
  ],
})
export class WebModule {}
