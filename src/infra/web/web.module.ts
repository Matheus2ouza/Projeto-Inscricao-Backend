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
import { DashboardAdminRoute } from './routes/dashboard/admin/dashboard-admin.route';
import { DashboardUserRoute } from './routes/dashboard/user/dashboard-user.route';
import { CreateEventExpensesRoute } from './routes/event-expenses/create/create-event-expenses.route';
import { FindAllPaginatedEventExpensesRoute } from './routes/event-expenses/find-all-paginated/find-all-paginated-event-expenses.route';
import { DeleteEventResponsibleRoute } from './routes/event-responsible/delete/delete-event-responsible.route';
import { ListInscriptonToAnalysisRoute } from './routes/event/analysis/list-inscription-to-analysis/list-inscription-to-analysis.route';
import { ListPaymentToAnalysisRoute } from './routes/event/analysis/list-payment-to-analysis/list-payment-to-analysis.route';
import { FindAccountsDetailsRoute } from './routes/event/check-in/find-accounts-details/find-accounts-details.route';
import { FindAccountsToCheckInRoute } from './routes/event/check-in/find-accounts-to-checkin/find-accounts-to-checkin.route';
import { CreateEventRoute } from './routes/event/create/create-event.route';
import { DeleteEventRoute } from './routes/event/delete/delete-event/delete-event.route';
import { DeleteImageEventRoute } from './routes/event/delete/delete-image/delete-image-event.route';
import { DeleteLogoEventRoute } from './routes/event/delete/delete-logo/delete-logo-event.route';
import { FindAllNamesEventRoute } from './routes/event/find-all-names/find-all-names-events.route';
import { FindAllPaginatedEventsRoute } from './routes/event/find-all-paginated/find-all-paginated-events.route';
import { FindAllPaginatedEventToInscriptionRoute } from './routes/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.route';
import { FindAllPaginatedEventToPaymentRoute } from './routes/event/find-all-to-analysis/payments/find-all-paginated-events-to-payments.route';
import { FindAllWithInscriptionsRoute } from './routes/event/find-all-with-inscriptions/find-all-with-inscriptions.route';
import { FindAllWithPaymentsRoute } from './routes/event/find-all-with-payments/find-all-with-payments.route';
import { FindAllWithTicketsRoute } from './routes/event/find-all-with-tickets/find-all-with-tickets.route';
import { FindByIdEventRoute } from './routes/event/find-by-id/find-by-id.route';
import { FindDetailsEventRoute } from './routes/event/find-details/find-details-event.route';
import { FindEventCarouselRoute } from './routes/event/find-event-carousel/find-event-carousel.route';
import { FindEventDateRoute } from './routes/event/find-event-dates/find-event-dates.route';
import { FindAccountWithInscriptionsRoute } from './routes/event/inscription/find-accounts-with-inscriptions/find-accounts-with-inscriptions.route';
import { FindAllToParticipantsRoute } from './routes/event/participants/find-all-to-participants/find-all-to-participants.route';
import { GeneratePdfSelectedInscriptionRoute } from './routes/event/pdf/generate-pdf-selected-inscriptions/generate-pdf-selected-inscriptions.route';
import { UpdateEventRoute } from './routes/event/update-event/update-event.route';
import { UpdateImageEventRoute } from './routes/event/update-image/update-image.route';
import { UpdateInscriptionEventRoute } from './routes/event/update-inscription/update-inscription-event.route';
import { UpdateLocationEventRoute } from './routes/event/update-location/update-location-event.route';
import { UpdateLogoEventRoute } from './routes/event/update-logo/update-logo.route';
import { UpdatePaymentEventRoute } from './routes/event/update-payment/update-payment-event.route';
import { UpdateTicketsSaleRoute } from './routes/event/update-tickets-sale/update-tickets-sale.route';
import { CreateInscriptionAvulRoute } from './routes/inscription-avul/create/create-inscription-avul.route';
import { FindAllPaginatedOnSiteRegistrationRoute } from './routes/inscription-avul/find-all-paginated/find-all-paginated-onsite-registration.route';
import { AnalysisInscriptionRoute } from './routes/inscription/analysis/analysis-inscription/analysis-inscription.route';
import { UpdateStatusInscriptionRoute } from './routes/inscription/analysis/update-status-inscription/update-status-inscription.route';
import { DeleteInscriptionRoute } from './routes/inscription/delete-inscription/delete-inscription.route';
import { FindAllPaginatedInscriptionsRoute } from './routes/inscription/find-all-paginated/find-all-paginated-inscription.route';
import { FindDetailsInscriptionRoute } from './routes/inscription/find-details-inscription/find-details-inscription.route';
import { GroupCancelRoute } from './routes/inscription/inscription-group/cancel/group-cancel.route';
import { GroupConfirmRoute } from './routes/inscription/inscription-group/confirm/group-confirm.route';
import { GroupFindCacheRoute } from './routes/inscription/inscription-group/find-cache/group-find-cache.route';
import { GroupUploadRoute } from './routes/inscription/inscription-group/upload/group-upload.route';
import { IndivCancelRoute } from './routes/inscription/inscription-indiv/cancel/indiv-cancel.route';
import { IndivConfirmRoute } from './routes/inscription/inscription-indiv/confirm/indiv-confirm.route';
import { IndivUploadRoute } from './routes/inscription/inscription-indiv/upload/indiv-upload.route';
import { GeneratePdfInscriptionRoute } from './routes/inscription/pdf/generate-pdf-inscription/generate-pdf-inscription.route';
import { UpdateInscriptionRoute } from './routes/inscription/update-inscription/update-inscription.route';
import { DeleteParticipantsRoute } from './routes/participants/delete/delete-participants.route';
import { ListParticipantsRoute } from './routes/participants/list-participants/list-participants.route';
import { GeneratePdfEtiquetaRoute } from './routes/participants/pdf/generate-pdf-etiqueta/generate-pdf-etiqueta.route';
import { GeneratePdfSelectedParticipantRoute } from './routes/participants/pdf/generate-pdf-participant/generate-pdf-participant.route';
import { UpdateParticipantsRoute } from './routes/participants/update/update-participants.route';
import { AnalysisPaymentRoute } from './routes/paymentInscription/analysis/analysis-payment/analysis-payment.route';
import { UpdatePaymentRoute } from './routes/paymentInscription/analysis/update-payment/update-payment.route';
import { CreatePaymentInscriptionRoute } from './routes/paymentInscription/create/create-payment-inscription.route';
import { DeletePaymentInscriptionRoute } from './routes/paymentInscription/delete/delete-payment-inscription.route';
import { ListAllPaymentsRoute } from './routes/paymentInscription/list-all-payments/list-all-payments.route';
import { PaymentDetailsRoute } from './routes/paymentInscription/payment-details/payment-details.route';
import { CreateRegionRoute } from './routes/region/create/create-region.route';
import { FindAllPaginatedRegionsRoute } from './routes/region/find-all-paginated/find-all-paginated-regions.route';
import { FindAllRegionsRoute } from './routes/region/findAllRegionNames/find-all-region-names.route';
import { ReportGeneralRoute } from './routes/report/report-general/general/report-general.route';
import { GeneratePdfGeneralReportRoute } from './routes/report/report-general/pdf/generate-pdf-general-report.route';
import { AnalysisPreSaleRoute } from './routes/tickets/analysis-pre-sale/analysis-pre-sale.route';
import { ApprovePreSaleRoute } from './routes/tickets/approve-pre-sale/approve-pre-sale.route';
import { CreateTicketRoute } from './routes/tickets/create/create-ticket.route';
import { FindAllListPreSaleRoute } from './routes/tickets/find-all-list-pre-sale/find-all-list-pre-sale.route';
import { FindTicketDetailsRoute } from './routes/tickets/find-ticket-details/find-ticket-details.route';
import { FindTicketsForSaleRoute } from './routes/tickets/find-tickets-for-sale/find-tickets-for-sale.route';
import { FindAllTicketRoute } from './routes/tickets/findAll/find-all-ticket.route';
import { GenerateTicketPdfSecondCopyRoute } from './routes/tickets/generate-second-copy/generate-second-copy.route';
import { PreSaleRoute } from './routes/tickets/pre-sale/pre-sale.route';
import { RejectPreSaleRoute } from './routes/tickets/reject-pre-sale/reject-pre-sale.route';
import { SaleGrupRoute } from './routes/tickets/sale-group/sale-group.route';
import { SaleTicketRoute } from './routes/tickets/sale/sale-ticket.route';
import { CreateTypeInscriptionRoute } from './routes/typeInscription/create/create-type-inscription.route';
import { FindAllInscriptionRoute } from './routes/typeInscription/find-all-inscriptionDescriptions/find-all-type-inscription.route';
import { FindByEventId } from './routes/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.route';
import { UpdateTypeInscriptionRoute } from './routes/typeInscription/update/update-type-inscription.route';
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
    // Welcome
    WelcomeRoute,

    // Dashboard
    DashboardAdminRoute,
    DashboardUserRoute,

    // Users
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
    UserProfileRoute,
    FindAllPaginatedUsersRoute,
    FindAllNamesUserRoute,

    // Events - Listings & Details
    FindAllPaginatedEventsRoute,
    FindAllWithInscriptionsRoute,
    FindAllWithPaymentsRoute,
    FindAllWithTicketsRoute,
    FindAllPaginatedEventToInscriptionRoute,
    FindAllPaginatedEventToPaymentRoute,
    FindEventDateRoute,
    FindEventCarouselRoute,
    FindAllNamesEventRoute,
    FindAllToParticipantsRoute,
    FindDetailsEventRoute,
    FindAccountWithInscriptionsRoute,
    GeneratePdfSelectedInscriptionRoute,
    ListInscriptonToAnalysisRoute,
    ListPaymentToAnalysisRoute,
    FindByIdEventRoute,
    FindAccountsToCheckInRoute,
    FindAccountsDetailsRoute,

    // Events - Create & Update
    CreateEventRoute,
    UpdateEventRoute,
    UpdateImageEventRoute,
    UpdateLogoEventRoute,
    UpdateLocationEventRoute,
    UpdatePaymentEventRoute,
    UpdateInscriptionEventRoute,
    UpdateTicketsSaleRoute,

    // Events - Delete
    DeleteEventRoute,
    DeleteImageEventRoute,
    DeleteLogoEventRoute,

    // Event Responsibles
    DeleteEventResponsibleRoute,

    // Regions
    CreateRegionRoute,
    FindAllRegionsRoute,
    FindAllPaginatedRegionsRoute,

    // Type Inscriptions
    CreateTypeInscriptionRoute,
    UpdateTypeInscriptionRoute,
    FindAllInscriptionRoute,
    FindByEventId,

    // Inscriptions
    FindAllPaginatedInscriptionsRoute,
    UpdateInscriptionRoute,
    DeleteInscriptionRoute,
    GeneratePdfInscriptionRoute,
    FindDetailsInscriptionRoute,

    // Inscriptions - Group
    GroupUploadRoute,
    GroupConfirmRoute,
    GroupCancelRoute,
    GroupFindCacheRoute,

    // Inscriptions - Individual
    IndivUploadRoute,
    IndivConfirmRoute,
    IndivCancelRoute,

    // Inscriptions - Analysis
    AnalysisInscriptionRoute,
    UpdateStatusInscriptionRoute,

    // Inscriptions - Avul
    CreateInscriptionAvulRoute,
    FindAllPaginatedOnSiteRegistrationRoute,

    // Payment Inscriptions
    CreatePaymentInscriptionRoute,
    AnalysisPaymentRoute,
    UpdatePaymentRoute,
    DeletePaymentInscriptionRoute,
    ListAllPaymentsRoute,
    PaymentDetailsRoute,

    // Participants
    ListParticipantsRoute,
    UpdateParticipantsRoute,
    DeleteParticipantsRoute,
    GeneratePdfSelectedParticipantRoute,
    GeneratePdfEtiquetaRoute,

    // Tickets
    CreateTicketRoute,
    FindAllTicketRoute,
    AnalysisPreSaleRoute,
    FindAllListPreSaleRoute,
    FindTicketsForSaleRoute,
    FindTicketDetailsRoute,
    GenerateTicketPdfSecondCopyRoute,
    SaleTicketRoute,
    PreSaleRoute,
    ApprovePreSaleRoute,
    RejectPreSaleRoute,
    SaleGrupRoute,

    // Event Expenses
    CreateEventExpensesRoute,
    FindAllPaginatedEventExpensesRoute,

    // Reports
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
