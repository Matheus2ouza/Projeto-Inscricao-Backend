import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ImageOptimizerModule } from 'src/infra/services/image-optimizer/image-optimizer.module';
import { MailModule } from 'src/infra/services/mail/mail.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { SupabaseModule } from 'src/infra/services/supabase/supabase.module';
import { CleanupExpiredCacheUsecase } from './cache/cleanup-expired-cache/cleanup-expired-cache.usecase';
import { CreateEventExpensesUsecase } from './event-expenses/create/create-event-expenses.usecase';
import { FindAllPaginatedEventExpensesUsecase } from './event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import { DeleteEventResponsibleUseCase } from './event-responsible/delete-event-responsible.usecase';
import { ListInscriptionToAnalysisUsecase } from './event/analysis/list-inscription-to-analysis/list-Inscription-to-analysis.usecase';
import { ListPaymentToAnalysisUsecase } from './event/analysis/list-payment-to-analysis/list-payment-to-analysis.usecase';
import { CreateEventUseCase } from './event/create/create-event.usecase';
import { FindAllPaginatedEventsUsecase } from './event/find-all-event/find-all-paginated-events.usecase';
import { FindAllnamesEventUsecase } from './event/find-all-names/find-all-names.usecase';
import { FindAllPaginatedEventToInscriptionUsecase } from './event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.usecase';
import { FindAllPaginatedEventToPaymentUsecase } from './event/find-all-to-analysis/payments/find-all-paginated-events-to-payment.usecase';
import { FindAllWithInscriptionsUsecase } from './event/find-all-with-inscriptions/find-all-with-inscriptions.usecase';
import { FindByIdEventUsecase } from './event/find-by-id/find-by-id.usecase';
import { FindDetailsEventUsecase } from './event/find-details/find-details-event.usecase';
import { FindEventCarouselUsecase } from './event/find-event-carousel/find-event-carousel.usecase';
import { FindAccountWithInscriptionsUsecase } from './event/inscription/find-accounts-with-inscriptions.usecase';
import { GeneratePdfSelectedInscriptionUsecase } from './event/pdf/generate-pdf-selected-inscriptions/generate-pdf-selected-inscriptions.usecase';
import { UpdateEventUseCase } from './event/update-event/update-event.usecase';
import { UpdateImageEventUsecase } from './event/update-image/update-image-event.usecase';
import { UpdateInscriptionEventUsecase } from './event/update-inscription/update-inscription-event.usecase';
import { UpdateLocationEventUsecase } from './event/update-location/update-location-event.usecase';
import { UpdatePaymentEventUsecase } from './event/update-payment/update-payment.usecase';
import { AnalysisInscriptionUsecase } from './inscription/analysis/analysis-inscription/analysis-inscription.usecase';
import { UpdateStatusInscriptionUsecase } from './inscription/analysis/update-status-inscription/update-status-inscription.usecase';
import { CreateInscriptionAvulUsecase } from './inscription/avul/create/create-inscription-avul.usecase';
import { FindAllPaginatedOnSiteRegistrationUsecase } from './inscription/avul/findAll/find-all-paginated-onsite-registration.usecase';
import { DeleteInscriptionUsecase } from './inscription/delete-inscription/delete-inscription.usecase';
import { FindAllPaginatedInscriptionsUsecase } from './inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import { FindCacheUsecase } from './inscription/find-cache/find-cache.usecase';
import { FindDetailsInscriptionUsecase } from './inscription/find-details-inscription/find-details-inscription.usecase';
import { GroupCancelUsecase } from './inscription/group/cancel/group-cancel.usecase';
import { GroupConfirmUsecase } from './inscription/group/confirm/group-confirm.usecase';
import { GroupFindCacheUsecase } from './inscription/group/find-cache/group-find-cache.usecase';
import { GroupUploadUsecase } from './inscription/group/upload/group-upload.usecase';
import { IndivCancelUsecase } from './inscription/indiv/cancel/indiv-cancel.usecase';
import { IndivConfirmUsecase } from './inscription/indiv/confirm/indiv-confirm.usecase';
import { IndivUploadValidateUsecase } from './inscription/indiv/upload/indiv-upload-valide.usecase';
import { GeneratePdfInscriptionUsecase } from './inscription/pdf/generate-pdf-inscription/generate-pdf-inscription.usecase';
import { AnalysisPaymentUsecase } from './paymentInscription/analysis/analysis-payment/analysis-payment.usecase';
import { UpdatePaymentUsecase } from './paymentInscription/analysis/update-status-payment/update-payment.usecase';
import { CreatePaymentInscriptionUsecase } from './paymentInscription/create/create-payment-inscription.usecase';
import { CreateRegionUseCase } from './region/create/create-region.usecase';
import { FindAllPaginatedRegionsUsecase } from './region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllRegionNamesUsecase } from './region/findAllRegionNames/find-all-region-names.usecase';
import { ReportGeneralUsecase } from './report/report-general/general/report-general.usecase';
import { GeneratePdfGeneralReportUsecase } from './report/report-general/pdf/generate-pdf-general-report.usecase';
import { CreateTicketUsecase } from './tickets/create/create-ticket.usecase';
import { FindTicketDetailsUsecase } from './tickets/find-ticket-details/find-ticket-details.usecase';
import { FindAllTicketsUsecase } from './tickets/findAll/find-all-ticket.usecase';
import { SaleGroupTicketUsecase } from './tickets/sale-group/sale-group-ticket.usecase';
import { SaleTicketUsecase } from './tickets/sale/sale-ticket.usecase';
import { CreateTypeInscriptionUseCase } from './typeInscription/create/create-type-inscription.usecase';
import { FindAllInscriptionUsecase } from './typeInscription/find-all-inscription/find-all-inscription.usecase';
import { FindTypeInscriptionByEventIdUsecase } from './typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.usecase';
import { CreateUserUsecase } from './user/create/create-user.usecase';
import { FindAllPaginatedUsersUsecase } from './user/find-all-paginated/find-all-paginated.usecase';
import { FindAllNamesUserUsecase } from './user/find-all-username/find-all-names-user.usecase';
import { FindUserUsecase } from './user/find-by-id/find-user.usecase';
import { LoginUserUsecase } from './user/login/login-user.usecase';
import { RefreshAuthTokenUserUsecase } from './user/refresh-auth-token/refresh-auth-token-user.usecase';

@Module({
  imports: [
    DataBaseModule,
    ServiceModule,
    SupabaseModule,
    ImageOptimizerModule,
    MailModule,
  ],
  providers: [
    //Users
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    FindAllPaginatedUsersUsecase,
    FindAllNamesUserUsecase,

    //Events
    CreateEventUseCase,
    UpdateEventUseCase,
    UpdateImageEventUsecase,
    UpdateLocationEventUsecase,
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    FindDetailsEventUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    FindAllWithInscriptionsUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,

    //List Inscription with Account
    FindAccountWithInscriptionsUsecase,

    //Events - ListToAnalysis
    ListInscriptionToAnalysisUsecase,
    ListPaymentToAnalysisUsecase,

    //Events - List Inscriptions
    FindAllPaginatedEventToInscriptionUsecase,
    //Events - List Payments
    FindAllPaginatedEventToPaymentUsecase,

    //Events - Responsible
    DeleteEventResponsibleUseCase,

    //Regions
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,

    //TypeInscription
    CreateTypeInscriptionUseCase,
    FindTypeInscriptionByEventIdUsecase,
    FindAllInscriptionUsecase,

    //Inscription
    FindAllPaginatedInscriptionsUsecase,
    FindDetailsInscriptionUsecase,
    DeleteInscriptionUsecase,
    FindCacheUsecase,

    //PDF - Inscription
    GeneratePdfInscriptionUsecase,
    GeneratePdfSelectedInscriptionUsecase,

    //Cache
    CleanupExpiredCacheUsecase,

    //InscriptionGroup
    GroupUploadUsecase,
    GroupConfirmUsecase,
    GroupCancelUsecase,
    GroupFindCacheUsecase,

    //InscriptionIndiv
    IndivUploadValidateUsecase,
    IndivConfirmUsecase,
    IndivCancelUsecase,

    //Analysis - Inscription
    AnalysisInscriptionUsecase,
    UpdateStatusInscriptionUsecase,

    //InscriptionAvul
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,

    //PaymentInscription
    CreatePaymentInscriptionUsecase,
    AnalysisPaymentUsecase,
    UpdatePaymentUsecase,

    //Tickets
    CreateTicketUsecase,
    FindAllTicketsUsecase,
    FindTicketDetailsUsecase,
    SaleGroupTicketUsecase,
    SaleTicketUsecase,

    //EventExpenses
    CreateEventExpensesUsecase,
    FindAllPaginatedEventExpensesUsecase,

    //Reports
    ReportGeneralUsecase,
    GeneratePdfGeneralReportUsecase,
  ],
  exports: [
    //Users
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    FindAllPaginatedUsersUsecase,
    FindAllNamesUserUsecase,

    //Events
    CreateEventUseCase,
    UpdateEventUseCase,
    UpdateImageEventUsecase,
    UpdateLocationEventUsecase,
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    FindDetailsEventUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    FindAllWithInscriptionsUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,

    //Lista Inscription with Account
    FindAccountWithInscriptionsUsecase,

    //Events - ListToAnalysis
    ListInscriptionToAnalysisUsecase,
    ListPaymentToAnalysisUsecase,

    //Events - List Inscriptions
    FindAllPaginatedEventToInscriptionUsecase,
    //Events - List Payments
    FindAllPaginatedEventToPaymentUsecase,

    //Events - Responsible
    DeleteEventResponsibleUseCase,

    //Regions
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,

    //TypeInscription
    CreateTypeInscriptionUseCase,
    FindTypeInscriptionByEventIdUsecase,
    FindAllInscriptionUsecase,

    //Inscription
    FindAllPaginatedInscriptionsUsecase,
    FindDetailsInscriptionUsecase,
    DeleteInscriptionUsecase,
    FindCacheUsecase,

    //PDF - Inscription
    GeneratePdfInscriptionUsecase,
    GeneratePdfSelectedInscriptionUsecase,

    //Cache
    CleanupExpiredCacheUsecase,

    //InscriptionGroup
    GroupUploadUsecase,
    GroupConfirmUsecase,
    GroupCancelUsecase,
    GroupFindCacheUsecase,

    //InscriptionIndiv
    IndivUploadValidateUsecase,
    IndivConfirmUsecase,
    IndivCancelUsecase,

    //Analysis - Inscription
    AnalysisInscriptionUsecase,
    UpdateStatusInscriptionUsecase,

    //InscriptionAvul
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,

    //PaymentInscription
    CreatePaymentInscriptionUsecase,
    AnalysisPaymentUsecase,
    UpdatePaymentUsecase,

    //Tickets
    CreateTicketUsecase,
    FindAllTicketsUsecase,
    FindTicketDetailsUsecase,
    SaleGroupTicketUsecase,
    SaleTicketUsecase,

    //EventExpenses
    CreateEventExpensesUsecase,
    FindAllPaginatedEventExpensesUsecase,

    //Reports
    ReportGeneralUsecase,
    GeneratePdfGeneralReportUsecase,
  ],
})
export class UsecaseModule {}
