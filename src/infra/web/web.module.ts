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
import { LoginUserRoute } from './routes/user/login/login-user.route';
import { RefreshAuthTokenRoute } from './routes/user/refresh-auth-token/refresh-auth-token.route';
import { FindByIdUserRoute } from './routes/user/find-by-id/find-by-id-user.route';
import { AuthGuardProvider } from './authenticator/auth.guard';
import { ServiceModule } from '../services/service.module';

@Module({
  imports: [ServiceModule, UsecaseModule],
  controllers: [
    WelcomeRoute,
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
  ],
  providers: [
    AuthGuardProvider,
    ValidatorDomainExceptionFilterProvider,
    DomainExceptionFilterProvider,
    UsecaseExceptionFilterProvider,
    CredentialsNotValidUsecaseExcepitonFilterProvider,
    UserAlreadyExistsUsecaseExceptionFilterProvider,
    UserNotFoundUsecaseExceptionFilterProvider,
    ServiceExceptionFilterProvider,
    RefreshTokenNotValidServiceExceptionFilterProvider,
  ],
})
export class WebMoudule {}
