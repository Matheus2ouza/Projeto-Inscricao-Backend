import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ImageOptimizerModule } from 'src/infra/services/image-optimizer/image-optimizer.module';
import { MailModule } from 'src/infra/services/mail/mail.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { SupabaseModule } from 'src/infra/services/supabase/supabase.module';
import { CreateEventExpensesUsecase } from './web/event-expenses/create/create-event-expenses.usecase';
import { FindAllPaginatedEventExpensesUsecase } from './web/event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import { DeleteEventResponsibleUseCase } from './web/event-responsible/delete-event-responsible.usecase';
import { ListInscriptionToAnalysisUsecase } from './web/event/analysis/list-inscription-to-analysis/list-Inscription-to-analysis.usecase';
import { ListPaymentToAnalysisUsecase } from './web/event/analysis/list-payment-to-analysis/list-payment-to-analysis.usecase';
import { CreateEventUseCase } from './web/event/create/create-event.usecase';
import { FindAllPaginatedEventsUsecase } from './web/event/find-all-event/find-all-paginated-events.usecase';
import { FindAllnamesEventUsecase } from './web/event/find-all-names/find-all-names.usecase';
import { FindAllPaginatedEventToInscriptionUsecase } from './web/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.usecase';
import { FindAllPaginatedEventToPaymentUsecase } from './web/event/find-all-to-analysis/payments/find-all-paginated-events-to-payment.usecase';
import { FindAllWithInscriptionsUsecase } from './web/event/find-all-with-inscriptions/find-all-with-inscriptions.usecase';
import { FindByIdEventUsecase } from './web/event/find-by-id/find-by-id.usecase';
import { FindDetailsEventUsecase } from './web/event/find-details/find-details-event.usecase';
import { FindEventCarouselUsecase } from './web/event/find-event-carousel/find-event-carousel.usecase';
import { FindAccountWithInscriptionsUsecase } from './web/event/inscription/find-accounts-with-inscriptions.usecase';
import { FindAllToParticipantsUsecase } from './web/event/participants/find-all-to-participants/find-all-to-participants.usecase';
import { GeneratePdfSelectedInscriptionUsecase } from './web/event/pdf/generate-pdf-selected-inscriptions/generate-pdf-selected-inscriptions.usecase';
import { UpdateEventUseCase } from './web/event/update-event/update-event.usecase';
import { UpdateImageEventUsecase } from './web/event/update-image/update-image-event.usecase';
import { UpdateInscriptionEventUsecase } from './web/event/update-inscription/update-inscription-event.usecase';
import { UpdateLocationEventUsecase } from './web/event/update-location/update-location-event.usecase';
import { UpdatePaymentEventUsecase } from './web/event/update-payment/update-payment.usecase';
import { AnalysisInscriptionUsecase } from './web/inscription/analysis/analysis-inscription/analysis-inscription.usecase';
import { UpdateStatusInscriptionUsecase } from './web/inscription/analysis/update-status-inscription/update-status-inscription.usecase';
import { CreateInscriptionAvulUsecase } from './web/inscription/avul/create/create-inscription-avul.usecase';
import { FindAllPaginatedOnSiteRegistrationUsecase } from './web/inscription/avul/findAll/find-all-paginated-onsite-registration.usecase';
import { DeleteInscriptionUsecase } from './web/inscription/delete-inscription/delete-inscription.usecase';
import { FindAllPaginatedInscriptionsUsecase } from './web/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import { FindCacheUsecase } from './web/inscription/find-cache/find-cache.usecase';
import { FindDetailsInscriptionUsecase } from './web/inscription/find-details-inscription/find-details-inscription.usecase';
import { GroupCancelUsecase } from './web/inscription/group/cancel/group-cancel.usecase';
import { GroupConfirmUsecase } from './web/inscription/group/confirm/group-confirm.usecase';
import { GroupFindCacheUsecase } from './web/inscription/group/find-cache/group-find-cache.usecase';
import { GroupUploadUsecase } from './web/inscription/group/upload/group-upload.usecase';
import { IndivCancelUsecase } from './web/inscription/indiv/cancel/indiv-cancel.usecase';
import { IndivConfirmUsecase } from './web/inscription/indiv/confirm/indiv-confirm.usecase';
import { IndivUploadValidateUsecase } from './web/inscription/indiv/upload/indiv-upload-valide.usecase';
import { GeneratePdfInscriptionUsecase } from './web/inscription/pdf/generate-pdf-inscription/generate-pdf-inscription.usecase';
import { UpdateInscriptionUsecase } from './web/inscription/update-inscription/update-inscription.usecase';
import { DeleteParticipantsUsecase } from './web/participants/delete/delete-participants.usecase';
import { ListParticipantsUsecase } from './web/participants/list-participants/list-participants.usecase';
import { GeneratePdfSelectedParticipantUsecase } from './web/participants/pdf/generate-pdf-participant/generate-pdf-participant.usecase';
import { UpdateParticipantsUsecase } from './web/participants/update/update-participants.usecase';
import { AnalysisPaymentUsecase } from './web/paymentInscription/analysis/analysis-payment/analysis-payment.usecase';
import { ApprovePaymentUsecase } from './web/paymentInscription/analysis/update-status-payment/approve-payment.usecase';
import { RejectPaymentUsecase } from './web/paymentInscription/analysis/update-status-payment/reject-payment.usecase';
import { RevertApprovedPaymentUsecase } from './web/paymentInscription/analysis/update-status-payment/revert-approved-inscription.usecase';
import { CreatePaymentInscriptionUsecase } from './web/paymentInscription/create/create-payment-inscription.usecase';
import { DeletePaymentInscriptionUsecase } from './web/paymentInscription/delete/delete-inscription.usecase';
import { CreateRegionUseCase } from './web/region/create/create-region.usecase';
import { FindAllPaginatedRegionsUsecase } from './web/region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllRegionNamesUsecase } from './web/region/findAllRegionNames/find-all-region-names.usecase';
import { ReportGeneralUsecase } from './web/report/report-general/general/report-general.usecase';
import { GeneratePdfGeneralReportUsecase } from './web/report/report-general/pdf/generate-pdf-general-report.usecase';
import { CreateTicketUsecase } from './web/tickets/create/create-ticket.usecase';
import { FindTicketDetailsUsecase } from './web/tickets/find-ticket-details/find-ticket-details.usecase';
import { FindAllTicketsUsecase } from './web/tickets/findAll/find-all-ticket.usecase';
import { SaleGroupTicketUsecase } from './web/tickets/sale-group/sale-group-ticket.usecase';
import { SaleTicketUsecase } from './web/tickets/sale/sale-ticket.usecase';
import { CreateTypeInscriptionUseCase } from './web/typeInscription/create/create-type-inscription.usecase';
import { FindAllInscriptionUsecase } from './web/typeInscription/find-all-inscription/find-all-inscription.usecase';
import { FindTypeInscriptionByEventIdUsecase } from './web/typeInscription/find-type-inscription-by-eventId/find-type-inscription-by-eventId.usecase';
import { UpdateTypeInscriptionUsecase } from './web/typeInscription/update/update-type-inscription.usecase';
import { CreateUserUsecase } from './web/user/create/create-user.usecase';
import { FindAllPaginatedUsersUsecase } from './web/user/find-all-paginated/find-all-paginated.usecase';
import { FindAllNamesUserUsecase } from './web/user/find-all-username/find-all-names-user.usecase';
import { FindUserUsecase } from './web/user/find-by-id/find-user.usecase';
import { LoginUserUsecase } from './web/user/login/login-user.usecase';
import { RefreshAuthTokenUserUsecase } from './web/user/refresh-auth-token/refresh-auth-token-user.usecase';
import { CleanupExpiredCacheUsecase } from './worker/cache/cleanup-expired-cache/cleanup-expired-cache.usecase';
import { FinalizeExpiredEventsUsecase } from './worker/finalize-expired-events/finalize-expired-events.usecase';

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
    FinalizeExpiredEventsUsecase,

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

    //Events - ListParticipants
    FindAllToParticipantsUsecase,

    //Regions
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,

    //TypeInscription
    CreateTypeInscriptionUseCase,
    UpdateTypeInscriptionUsecase,
    FindTypeInscriptionByEventIdUsecase,
    FindAllInscriptionUsecase,

    //Inscription
    UpdateInscriptionUsecase,
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

    // Atualização do status do PaymentInscription
    ApprovePaymentUsecase,
    RejectPaymentUsecase,
    RevertApprovedPaymentUsecase,

    //Deleta um PaymentInscription
    DeletePaymentInscriptionUsecase,

    // Participants
    ListParticipantsUsecase,
    UpdateParticipantsUsecase,
    DeleteParticipantsUsecase,

    //PDF - Participants
    GeneratePdfSelectedParticipantUsecase,

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
    FinalizeExpiredEventsUsecase,

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

    //Events - ListParticipants
    FindAllToParticipantsUsecase,

    //Regions
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,

    //TypeInscription
    CreateTypeInscriptionUseCase,
    UpdateTypeInscriptionUsecase,
    FindTypeInscriptionByEventIdUsecase,
    FindAllInscriptionUsecase,

    //Inscription
    UpdateInscriptionUsecase,
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

    // Atualização do status do PaymentInscription
    ApprovePaymentUsecase,
    RejectPaymentUsecase,
    RevertApprovedPaymentUsecase,

    //Deleta um PaymentInscription
    DeletePaymentInscriptionUsecase,

    //Participants
    ListParticipantsUsecase,
    UpdateParticipantsUsecase,
    DeleteParticipantsUsecase,

    //PDF - Participants
    GeneratePdfSelectedParticipantUsecase,

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
