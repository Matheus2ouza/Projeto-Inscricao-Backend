import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { ServiceModule } from '../services/service.module';
import { AuthGuardProvider } from './authenticator/guards/auth.guard';
import { RoleGuardProvider } from './authenticator/guards/role.guard';
import { DomainExceptionFilterProvider } from './filters/domain/domain-exception.filter';
import { ValidatorDomainExceptionFilterProvider } from './filters/domain/validator-domain-exception.filter';
import { AuthTokenNotValidServiceExceptionFilterProvider } from './filters/infra/service/auth-token-not-valid-service-exception.filter';
import { RefreshTokenNotValidServiceExceptionFilterProvider } from './filters/infra/service/refresh-token-not-valid-service-exception.filter';
import { ServiceExceptionFilterProvider } from './filters/infra/service/server-exception.filter';
import { CredentialsNotValidUsecaseExcepitonFilterProvider } from './filters/usecases/credentials-not-valid-usecase-exception.filter';
import { UsecaseExceptionFilterProvider } from './filters/usecases/usecase-exception.filter';
import { UserAlreadyExistsUsecaseExceptionFilterProvider } from './filters/usecases/user-already-exist-usecase-exception.filter';
import { UserNotAllowedToCreateUserUsecaseExceptionFilterProvider } from './filters/usecases/user-not-allowed-to-create-user-usecase-exception.filter';
import { UserNotFoundUsecaseExceptionFilterProvider } from './filters/usecases/user-not-found-usecase-exception.filter';
import { CreateEventExpensesRoute } from './routes/event-expenses/create/create-event-expenses.route';
import { FindAllPaginatedEventExpensesRoute } from './routes/event-expenses/find-all-paginated/find-all-paginated-event-expenses.route';
import { CreateEventRoute } from './routes/event/create/create-event.route';
import { FindAllNamesEventRoute } from './routes/event/find-all-names/find-all-names-events.route';
import { FindAllPaginatedEventsRoute } from './routes/event/find-all-paginated/find-all-paginated-events.route';
import { FindByIdEventRoute } from './routes/event/find-by-id/find-by-id.route';
import { FindEventCarouselRoute } from './routes/event/find-event-carousel/find-event-carousel.route';
import { ListInscriptionRoute } from './routes/event/list-inscription/list-Inscription.route';
import { UpdateInscriptionEventRoute } from './routes/event/update-inscription/update-inscription-event.route';
import { UpdatePaymentEventRoute } from './routes/event/update-payment/update-payment-event.route';
import { AnalysisInscriptionRoute } from './routes/inscription/analysis-inscription/analysis-inscription.route';
import { FindAllPaginatedInscriptionsRoute } from './routes/inscription/find-all-paginated/find-all-paginated-inscription.route';
import { FindDetailsInscriptionRoute } from './routes/inscription/find-details-inscription/find-details-inscription.route';
import { GroupConfirmRoute } from './routes/inscription/inscriptionGroup/confirm/group-confirm.route';
import { GroupFindCacheRoute } from './routes/inscription/inscriptionGroup/find-cache/group-find-cache.route';
import { GroupUploadRoute } from './routes/inscription/inscriptionGroup/upload/group-upload.route';
import { IndivConfirmRoute } from './routes/inscription/inscriptionIndiv/confirm/indiv-confirm.route';
import { IndivUploadRoute } from './routes/inscription/inscriptionIndiv/upload/indiv-upload.route';
import { CreateInscriptionAvulRoute } from './routes/inscriptionAvul/create/create-inscription-avul.route';
import { FindAllPaginatedOnSiteRegistrationRoute } from './routes/inscriptionAvul/find-all-paginated/find-all-paginated-onsite-registration.route';
import { CreatePaymentInscriptionRoute } from './routes/paymentInscription/create/create-payment-inscription.route';
import { CreateRegionRoute } from './routes/region/create/create-region.route';
import { FindAllPaginatedRegionsRoute } from './routes/region/find-all-paginated/find-all-paginated-regions.route';
import { FindAllRegionsRoute } from './routes/region/findAllRegionNames/find-all-region-names.route';
import { ReportGeneralRoute } from './routes/report/report-general/general/report-general.route';
import { GeneratePdfGeneralReportRoute } from './routes/report/report-general/pdf/generate-pdf-general-report.route';
import { CreateTicketRoute } from './routes/tickets/create/create-ticket.route';
import { FindTicketDetailsRoute } from './routes/tickets/find-ticket-details/find-ticket-details.route';
import { FindAllTicketRoute } from './routes/tickets/findAll/find-all-ticket.route';
import { SaleGroupTicketRoute } from './routes/tickets/sale-group/sale-group-ticket.route';
import { SaleTicketRoute } from './routes/tickets/sale/sale-ticket.route';
import { CreateTypeInscriptionRoute } from './routes/typeInscription/create/create-type-inscription.route';
import { FindAllInscriptionRoute } from './routes/typeInscription/find-all-inscriptionDescriptions/find-all-type-inscription.route';
import { FindByEventId } from './routes/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.route';
import { CreateUserRoute } from './routes/user/create/create-user.route';
import { FindAllPaginatedUsersRoute } from './routes/user/find-all-paginated/find-all-paginated-users.route';
import { FindByIdUserRoute } from './routes/user/find-by-id/find-by-id-user.route';
import { LoginUserRoute } from './routes/user/login/login-user.route';
import { UserProfileRoute } from './routes/user/profile/user-profile.route';
import { RefreshAuthTokenRoute } from './routes/user/refresh-auth-token/refresh-auth-token.route';
import { WelcomeRoute } from './routes/welcome.route';

@Module({
  imports: [ServiceModule, UsecaseModule],
  controllers: [
    //Rota bem vindo
    WelcomeRoute,

    //User
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
    UserProfileRoute,
    FindAllPaginatedUsersRoute,

    //Event
    ListInscriptionRoute,
    CreateEventRoute,
    UpdatePaymentEventRoute,
    UpdateInscriptionEventRoute,
    FindAllPaginatedEventsRoute,
    FindEventCarouselRoute,
    FindByIdEventRoute,
    FindByEventId,
    FindAllNamesEventRoute,

    //Region
    CreateRegionRoute,
    FindAllRegionsRoute,
    FindAllPaginatedRegionsRoute,

    //TypeInscription
    CreateTypeInscriptionRoute,
    FindDetailsInscriptionRoute,

    //Inscription
    FindAllInscriptionRoute,
    FindAllPaginatedInscriptionsRoute,
    AnalysisInscriptionRoute,

    //InscriptionGrup
    GroupUploadRoute,
    GroupConfirmRoute,
    GroupFindCacheRoute,

    //InscriptionIndiv
    IndivUploadRoute,
    IndivConfirmRoute,

    //InscrpitonAvul
    CreateInscriptionAvulRoute,
    FindAllPaginatedOnSiteRegistrationRoute,

    //PaymentInscription
    CreatePaymentInscriptionRoute,

    //Ticket
    CreateTicketRoute,
    FindAllTicketRoute,
    FindTicketDetailsRoute,
    SaleGroupTicketRoute,
    SaleTicketRoute,

    //Expenses
    CreateEventExpensesRoute,
    FindAllPaginatedEventExpensesRoute,

    //Relatorio
    ReportGeneralRoute,
    GeneratePdfGeneralReportRoute,
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
