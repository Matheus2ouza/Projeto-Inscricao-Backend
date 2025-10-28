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
import { ListInscriptonToAnalysisRoute } from './routes/event/analysis/list-inscription-to-analysis/list-inscription-to-analysis.route';
import { ListPaymentToAnalysisRoute } from './routes/event/analysis/list-payment-to-analysis/list-payment-to-analysis.route';
import { CreateEventRoute } from './routes/event/create/create-event.route';
import { FindAllNamesEventRoute } from './routes/event/find-all-names/find-all-names-events.route';
import { FindAllPaginatedEventsRoute } from './routes/event/find-all-paginated/find-all-paginated-events.route';
import { FindAllPaginatedEventToInscriptionRoute } from './routes/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.route';
import { FindAllPaginatedEventToPaymentRoute } from './routes/event/find-all-to-analysis/payments/find-all-paginated-events-to-payments.route';
import { FindByIdEventRoute } from './routes/event/find-by-id/find-by-id.route';
import { FindEventCarouselRoute } from './routes/event/find-event-carousel/find-event-carousel.route';
import { UpdateInscriptionEventRoute } from './routes/event/update-inscription/update-inscription-event.route';
import { UpdatePaymentEventRoute } from './routes/event/update-payment/update-payment-event.route';
import { CreateInscriptionAvulRoute } from './routes/inscription-avul/create/create-inscription-avul.route';
import { FindAllPaginatedOnSiteRegistrationRoute } from './routes/inscription-avul/find-all-paginated/find-all-paginated-onsite-registration.route';
import { AnalysisInscriptionRoute } from './routes/inscription/analysis/analysis-inscription/analysis-inscription.route';
import { UpdateStatusInscriptionRoute } from './routes/inscription/analysis/update-status-inscription/update-status-inscription.route';
import { DeleteInscriptionRoute } from './routes/inscription/delete-inscription/delete-inscription.route';
import { FindAllPaginatedInscriptionsRoute } from './routes/inscription/find-all-paginated/find-all-paginated-inscription.route';
import { FindDetailsInscriptionRoute } from './routes/inscription/find-details-inscription/find-details-inscription.route';
import { GroupConfirmRoute } from './routes/inscription/inscription-group/confirm/group-confirm.route';
import { GroupFindCacheRoute } from './routes/inscription/inscription-group/find-cache/group-find-cache.route';
import { GroupUploadRoute } from './routes/inscription/inscription-group/upload/group-upload.route';
import { IndivConfirmRoute } from './routes/inscription/inscription-indiv/confirm/indiv-confirm.route';
import { IndivUploadRoute } from './routes/inscription/inscription-indiv/upload/indiv-upload.route';
import { ApprovePaymentRoute } from './routes/paymentInscription/analysis/approve-payment/approve-payment.route';
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
import { FindAllNamesUserRoute } from './routes/user/find-all-names/find-all-names-user.route';
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
    FindAllNamesUserRoute,

    //Event
    CreateEventRoute,
    UpdatePaymentEventRoute,
    UpdateInscriptionEventRoute,
    FindAllPaginatedEventsRoute,
    FindEventCarouselRoute,
    FindByIdEventRoute,
    FindByEventId,
    FindAllNamesEventRoute,

    //Events - ListToAnalysis
    ListInscriptonToAnalysisRoute,
    ListPaymentToAnalysisRoute,

    //Event - Analise
    //Inscriptions
    FindAllPaginatedEventToInscriptionRoute,
    //Payments
    FindAllPaginatedEventToPaymentRoute,

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
    DeleteInscriptionRoute,

    //InscriptionGrup
    GroupUploadRoute,
    GroupConfirmRoute,
    GroupFindCacheRoute,

    //InscriptionIndiv
    IndivUploadRoute,
    IndivConfirmRoute,

    //Analysis - Inscription
    AnalysisInscriptionRoute,
    UpdateStatusInscriptionRoute,

    //InscrpitonAvul
    CreateInscriptionAvulRoute,
    FindAllPaginatedOnSiteRegistrationRoute,

    //PaymentInscription
    CreatePaymentInscriptionRoute,
    ApprovePaymentRoute,

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
