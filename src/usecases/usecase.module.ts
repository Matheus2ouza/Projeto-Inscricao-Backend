import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ImageOptimizerModule } from 'src/infra/services/image-optimizer/image-optimizer.module';
import { MailModule } from 'src/infra/services/mail/mail.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { SupabaseModule } from 'src/infra/services/supabase/supabase.module';
import { FindActiveEventsAdminUsecase } from './web/dashboard/admin/find-active-events.usecase';
import { FindActiveParticipantsAdminUsecase } from './web/dashboard/admin/find-active-participants.usecase';
import { FindTotalCollectedAdminUsecase } from './web/dashboard/admin/find-total-collected.usecase';
import { FindTotalDebtAdminUsecase } from './web/dashboard/admin/find-total-debt.usecase';
import { FindActiveEventsUserUsecase } from './web/dashboard/user/find-active-events.usecase';
import { FindTotalDebtUserUsecase } from './web/dashboard/user/find-total-debt.usecase';
import { FindTotalInscriptionsUserUsecase } from './web/dashboard/user/find-total-inscriptions.usecase';
import { CreateEventExpensesUsecase } from './web/event-expenses/create/create-event-expenses.usecase';
import { FindAllPaginatedEventExpensesUsecase } from './web/event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import { DeleteEventResponsibleUseCase } from './web/event-responsible/delete-event-responsible.usecase';
import { ListInscriptionToAnalysisUsecase } from './web/event/analysis/list-inscription-to-analysis/list-Inscription-to-analysis.usecase';
import { FindAccountsDetailsUseCase } from './web/event/check-in/find-accounts-details/find-accounts-details.usecase';
import { FindAccountsToCheckInUsecase } from './web/event/check-in/find-accounts-to-checkin/find-accounts-to-checkin.usecase';
import { CreateEventUseCase } from './web/event/create/create-event.usecase';
import { DeleteEventUsecase } from './web/event/delete/delete-event/delete-event.usecase';
import { DeleteImageEventUsecase } from './web/event/delete/delete-image/delete-image-event.usecase';
import { DeleteLogoEventUsecase } from './web/event/delete/delete-logo/delete-logo-event.usecase';
import { FindAllPaginatedEventsUsecase } from './web/event/find-all-event/find-all-paginated-events.usecase';
import { FindAllnamesEventUsecase } from './web/event/find-all-names/find-all-names.usecase';
import { FindAllPaginatedEventToInscriptionUsecase } from './web/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.usecase';
import { FindAllPaginatedEventToPaymentUsecase } from './web/event/find-all-to-analysis/payments/find-all-paginated-events-to-payment.usecase';
import { FindAllWithAccountUsecase } from './web/event/find-all-with-account/find-all-with-account.usecase';
import { FindAllWithExpensesUsecase } from './web/event/find-all-with-expenses/find-all-with-expenses.usecase';
import { FindAllWithInscriptionsUsecase } from './web/event/find-all-with-inscriptions/find-all-with-inscriptions.usecase';
import { FindAllWithParticipantsUsecase } from './web/event/find-all-with-participants/find-all-with-participants.usecase';
import { FindAllWithPaymentsUsecase } from './web/event/find-all-with-payments/find-all-with-payments.usecase';
import { FindAllWithTicketsUsecase } from './web/event/find-all-with-tickets/find-all-with-tickets.usecase';
import { FindByIdEventUsecase } from './web/event/find-by-id/find-by-id.usecase';
import { FindDetailsEventUsecase } from './web/event/find-details/find-details-event.usecase';
import { FindEventCarouselUsecase } from './web/event/find-event-carousel/find-event-carousel.usecase';
import { FindEventDateUsecase } from './web/event/find-event-dates/find-event-dates.usecase';
import { FindAccountWithInscriptionsUsecase } from './web/event/inscription/find-accounts-with-inscriptions.usecase';
import { FindAllToParticipantsUsecase } from './web/event/participants/find-all-to-participants/find-all-to-participants.usecase';
import { GeneratePdfSelectedInscriptionUsecase } from './web/event/pdf/generate-pdf-selected-inscriptions/generate-pdf-selected-inscriptions.usecase';
import { UpdateAllowCardUseCase } from './web/event/update-allow-card/update-allow-card.usecase';
import { UpdateEventUseCase } from './web/event/update-event/update-event.usecase';
import { UpdateImageEventUsecase } from './web/event/update-image/update-image-event.usecase';
import { UpdateInscriptionEventUsecase } from './web/event/update-inscription/update-inscription-event.usecase';
import { UpdateLocationEventUsecase } from './web/event/update-location/update-location-event.usecase';
import { UpdateLogoEventUsecase } from './web/event/update-logo/update-logo.usecase';
import { UpdatePaymentEventUsecase } from './web/event/update-payment/update-payment.usecase';
import { UpdateTicketsSaleUsecase } from './web/event/update-tickets-sale/update-tickets-sale.usecase';
import { AnalysisInscriptionUsecase } from './web/inscription/analysis/analysis-inscription/analysis-inscription.usecase';
import { UpdateStatusInscriptionUsecase } from './web/inscription/analysis/update-status-inscription/update-status-inscription.usecase';
import { CreateInscriptionAvulUsecase } from './web/inscription/avul/create/create-inscription-avul.usecase';
import { FindDetailsInscriptionAvulUsecase } from './web/inscription/avul/find-details-inscription-avul/find-details-inscription-avul.usecase';
import { FindAllPaginatedOnSiteRegistrationUsecase } from './web/inscription/avul/findAll/find-all-paginated-onsite-registration.usecase';
import { DeleteInscriptionUsecase } from './web/inscription/delete-inscription/delete-inscription.usecase';
import { FindAllPaginatedInscriptionsUsecase } from './web/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import { FindCacheUsecase } from './web/inscription/find-cache/find-cache.usecase';
import { FindDetailsGuestInscriptionUsecase } from './web/inscription/find-details-gues-inscription/find-details-gues-inscription';
import { FindDetailsInscriptionUsecase } from './web/inscription/find-details-inscription/find-details-inscription.usecase';
import { RegisterGroupInscriptionUsecase } from './web/inscription/group/register/register-grup-inscription.usecase';
import { RegisterGuestInscriptionUsecase } from './web/inscription/guest/register/register-guest-inscription.usecase';
import { RegisterIndivInscriptionUsecase } from './web/inscription/indiv/register/register-indiv-inscription.usecase';
import { GeneratePdfAllInscriptionsUsecase } from './web/inscription/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import { GeneratePdfInscriptionUsecase } from './web/inscription/pdf/generate-pdf-inscription/generate-pdf-inscription.usecase';
import { UpdateGuestInscriptionUsecase } from './web/inscription/update-guest-inscription/update-guest-inscription.usecase';
import { UpdateInscriptionUsecase } from './web/inscription/update-inscription/update-inscription.usecase';
import { UpdateValidateInscriptionUsecase } from './web/inscription/update-validate-inscription/update-validate-inscription.usecase';
import { CreateMembersUsecase } from './web/members/create/create-membrers.usecase';
import { FindAllMembersByAccountUsecase } from './web/members/find-all-members-by-account/find-all-members-by-account.usecase';
import { FindAllPaginatedMembersUsecase } from './web/members/find-all-paginated/find-all-paginated-members.usecase';
import { DeleteParticipantsUsecase } from './web/participants/delete/delete-participants.usecase';
import { ListGuestParticipantsUsecase } from './web/participants/list-guest-participants/list-guest-participants.usecase';
import { ListParticipantsUsecase } from './web/participants/list-participants/list-participants.usecase';
import { GeneratePdfEtiquetaUseCase } from './web/participants/pdf/generate-pdf-etiqueta/generate-pdf-etiqueta.usecase';
import { GeneratePdfParticipantsAllUsecase } from './web/participants/pdf/generate-pdf-participant/generate-pdf-participants-all.usecase';
import { GeneratePdfParticipantsSelectedAccountsUsecase } from './web/participants/pdf/generate-pdf-participant/generate-pdf-participants-selected-accounts.usecase';
import { UpdateParticipantsUsecase } from './web/participants/update/update-participants.usecase';
import { AnalysisPaymentsPendingUsecase } from './web/payments/analysis-payments-pending/analysis-payments-pending.usecase';
import { ApprovePaymentUsecase } from './web/payments/approve-payment/approve-payment.usecase';
import { ConfirmPaymentUsecase } from './web/payments/asaas/confirm-payment/confirm-payment.usecase';
import { PaymentCanceledUseCase } from './web/payments/asaas/payment-canceled/payment-canceled.usecase';
import { PaymentReceivedUsecase } from './web/payments/asaas/payment-received/payment-received.usecase';
import { PaymentReprovedUsecase } from './web/payments/asaas/payment-reproved/payment-reproved.usecase';
import { DeletePaymentUsecase } from './web/payments/delete/delete-payment.usecase';
import { ListAllPaymentsPendingUsecase } from './web/payments/list-all-payments-pending/list-all-payments-pending.usecase';
import { ListAllPaymentsUseCase } from './web/payments/list-all-payments/list-all-payments.usecase';
import { ListPaymentPendingDetailsUsecase } from './web/payments/list-payment-pending-details/list-payment-pending-details.usecase';
import { PaymentsDetailsUsecase } from './web/payments/payments-details/payments-details.usecase';
import { RegisterPaymentCredUsecase } from './web/payments/register-cred/register-payment-cred.usecase';
import { RegisterPaymentPixUsecase } from './web/payments/register-pix/register-payment-pix.usecase';
import { RejectedPaymentUsecase } from './web/payments/rejected-payment/rejected-payment.usecase';
import { ReversePaymentUsecase } from './web/payments/reverse-payment/reverse-payment.usecase';
import { UpdatePaymentReceiptUsecase } from './web/payments/update-payment-receipt/update-payment-receipt.usecase';
import { CreateRegionUseCase } from './web/region/create/create-region.usecase';
import { FindAllPaginatedRegionsUsecase } from './web/region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllRegionNamesUsecase } from './web/region/findAllRegionNames/find-all-region-names.usecase';
import { ReportFinancialUsecase } from './web/report/report-general/financial/report-financial.usecase';
import { ReportGeneralUsecase } from './web/report/report-general/general/report-general.usecase';
import { GeneratePdfFinancialReportUsecase } from './web/report/report-general/pdf-financial/generate-pdf-financial-report.usecase';
import { GeneratePdfGeneralReportUsecase } from './web/report/report-general/pdf-geral/generate-pdf-general-report.usecase';
import { AnalysisPreSaleUseCase } from './web/tickets/analysis-pre-sale/analysis-pre-sale.usecase';
import { ApprovePreSaleUseCase } from './web/tickets/approve-pre-sale/approve-pre-sale.usecase';
import { CreateTicketUsecase } from './web/tickets/create/create-ticket.usecase';
import { FindAllListPreSaleUsecase } from './web/tickets/find-all-list-pre-sale/find-all-list-pre-sale.usecase';
import { FindTicketDetailsUsecase } from './web/tickets/find-ticket-details/find-ticket-details.usecase';
import { FindTicketsForSaleUsecase } from './web/tickets/find-tickets-for-sale/find-tickets-for-sale.usecase';
import { FindAllTicketsUsecase } from './web/tickets/findAll/find-all-ticket.usecase';
import { GenerateTicketPdfSecondCopyUsecase } from './web/tickets/generate-ticket-pdf-second-copy/generate-ticket-pdf-second-copy.usecase';
import { PreSaleUseCase } from './web/tickets/pre-sale/pre-sale.usecase';
import { RejectPreSaleUseCase } from './web/tickets/reject-pre-sale/reject-pre-sale.usecase';
import { SaleGrupUsecase } from './web/tickets/sale-group/sale-group.usecase';
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
import { CancelExpiredInscriptionsUseCase } from './worker/cancel-expired-inscriptions/cancel-expired-inscriptions.usecase';
import { CleanupCancelledTicketSalesUsecase } from './worker/cleanup-cancelled-ticket-sales/cleanup-cancelled-ticket-sales.usecase';
import { CleanupExpiredCacheUsecase } from './worker/cleanup-expired-cache/cleanup-expired-cache.usecase';
import { CleanupGuestInscriptionUsecase } from './worker/cleanup-guest-inscription/cleanup-guest-inscription.usecase';
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
    // Dashboard
    FindActiveEventsAdminUsecase,
    FindActiveParticipantsAdminUsecase,
    FindTotalCollectedAdminUsecase,
    FindTotalDebtAdminUsecase,
    FindActiveEventsUserUsecase,
    FindTotalDebtUserUsecase,
    FindTotalInscriptionsUserUsecase,

    // Users
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    FindAllPaginatedUsersUsecase,
    FindAllNamesUserUsecase,

    // Members
    CreateMembersUsecase,
    FindAllPaginatedMembersUsecase,
    FindAllMembersByAccountUsecase,

    // Events - CRUD & Updates
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventUsecase,
    UpdateAllowCardUseCase,
    UpdateImageEventUsecase,
    UpdateLogoEventUsecase,
    UpdateLocationEventUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,
    UpdateTicketsSaleUsecase,
    DeleteImageEventUsecase,
    DeleteLogoEventUsecase,

    // Events - Listings & Details
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    FindDetailsEventUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    FindAllWithInscriptionsUsecase,
    FindAllWithPaymentsUsecase,
    FindAllWithTicketsUsecase,
    FindAllWithExpensesUsecase,
    FindAllWithAccountUsecase,
    FindEventDateUsecase,
    FindAccountWithInscriptionsUsecase,
    ListInscriptionToAnalysisUsecase,
    FindAllPaginatedEventToInscriptionUsecase,
    FindAllPaginatedEventToPaymentUsecase,
    FindAccountsToCheckInUsecase,
    FindAccountsDetailsUseCase,
    DeleteEventResponsibleUseCase,
    FindAllToParticipantsUsecase,

    // Regions
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,

    // Type Inscriptions
    CreateTypeInscriptionUseCase,
    UpdateTypeInscriptionUsecase,
    FindTypeInscriptionByEventIdUsecase,
    FindAllInscriptionUsecase,

    // Inscriptions
    FindAllPaginatedInscriptionsUsecase,
    FindDetailsInscriptionUsecase,
    DeleteInscriptionUsecase,
    FindCacheUsecase,
    RegisterGroupInscriptionUsecase,
    RegisterIndivInscriptionUsecase,
    RegisterGuestInscriptionUsecase,
    AnalysisInscriptionUsecase,
    UpdateStatusInscriptionUsecase,
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,
    FindDetailsInscriptionAvulUsecase,
    FindDetailsGuestInscriptionUsecase,
    FindAllWithParticipantsUsecase,

    // Updates
    UpdateInscriptionUsecase,
    UpdateGuestInscriptionUsecase,
    UpdateValidateInscriptionUsecase,

    // Inscription PDF
    GeneratePdfInscriptionUsecase,
    GeneratePdfSelectedInscriptionUsecase,
    GeneratePdfAllInscriptionsUsecase,

    // Payment
    ListAllPaymentsUseCase,
    ListAllPaymentsPendingUsecase,
    ListPaymentPendingDetailsUsecase,
    RegisterPaymentCredUsecase,
    RegisterPaymentPixUsecase,
    DeletePaymentUsecase,
    AnalysisPaymentsPendingUsecase,
    PaymentsDetailsUsecase,
    ApprovePaymentUsecase,
    RejectedPaymentUsecase,
    ReversePaymentUsecase,

    UpdatePaymentReceiptUsecase,

    //ASAAS
    ConfirmPaymentUsecase,
    PaymentReceivedUsecase,
    PaymentCanceledUseCase,
    PaymentReprovedUsecase,

    // Participants
    ListParticipantsUsecase,
    ListGuestParticipantsUsecase,
    UpdateParticipantsUsecase,
    DeleteParticipantsUsecase,
    GeneratePdfParticipantsSelectedAccountsUsecase,
    GeneratePdfParticipantsAllUsecase,
    GeneratePdfEtiquetaUseCase,

    // Tickets
    CreateTicketUsecase,
    FindAllTicketsUsecase,
    FindTicketsForSaleUsecase,
    AnalysisPreSaleUseCase,
    FindAllListPreSaleUsecase,
    ApprovePreSaleUseCase,
    RejectPreSaleUseCase,
    PreSaleUseCase,
    FindTicketDetailsUsecase,
    SaleTicketUsecase,
    GenerateTicketPdfSecondCopyUsecase,
    SaleGrupUsecase,

    // Event Expenses
    CreateEventExpensesUsecase,
    FindAllPaginatedEventExpensesUsecase,

    // Reports
    ReportGeneralUsecase,
    GeneratePdfGeneralReportUsecase,
    ReportFinancialUsecase,
    GeneratePdfFinancialReportUsecase,

    // Background tasks
    CancelExpiredInscriptionsUseCase,
    CleanupGuestInscriptionUsecase,
    CleanupExpiredCacheUsecase,
    FinalizeExpiredEventsUsecase,
    CleanupCancelledTicketSalesUsecase,
  ],
  exports: [
    // Dashboard
    FindActiveEventsAdminUsecase,
    FindActiveParticipantsAdminUsecase,
    FindTotalCollectedAdminUsecase,
    FindTotalDebtAdminUsecase,
    FindActiveEventsUserUsecase,
    FindTotalDebtUserUsecase,
    FindTotalInscriptionsUserUsecase,

    // Users
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    FindAllPaginatedUsersUsecase,
    FindAllNamesUserUsecase,

    // Members
    CreateMembersUsecase,
    FindAllPaginatedMembersUsecase,
    FindAllMembersByAccountUsecase,

    // Events - CRUD & Updates
    CreateEventUseCase,
    UpdateEventUseCase,
    DeleteEventUsecase,
    UpdateAllowCardUseCase,
    UpdateImageEventUsecase,
    UpdateLogoEventUsecase,
    UpdateTicketsSaleUsecase,
    UpdateLocationEventUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,
    FindAccountsToCheckInUsecase,
    FindAccountsDetailsUseCase,
    DeleteLogoEventUsecase,
    DeleteImageEventUsecase,

    // Events - Listings & Details
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    FindDetailsEventUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    FindAllWithInscriptionsUsecase,
    FindAllWithPaymentsUsecase,
    FindAllWithTicketsUsecase,
    FindAllWithExpensesUsecase,
    FindAllWithAccountUsecase,
    FindEventDateUsecase,
    FindAccountWithInscriptionsUsecase,
    ListInscriptionToAnalysisUsecase,
    FindAllPaginatedEventToInscriptionUsecase,
    FindAllPaginatedEventToPaymentUsecase,
    DeleteEventResponsibleUseCase,
    FindAllToParticipantsUsecase,

    // Regions
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,

    // Type Inscriptions
    CreateTypeInscriptionUseCase,
    UpdateTypeInscriptionUsecase,
    FindTypeInscriptionByEventIdUsecase,
    FindAllInscriptionUsecase,

    // Inscriptions
    FindAllPaginatedInscriptionsUsecase,
    FindDetailsInscriptionUsecase,
    DeleteInscriptionUsecase,
    FindCacheUsecase,
    RegisterGroupInscriptionUsecase,
    RegisterIndivInscriptionUsecase,
    RegisterGuestInscriptionUsecase,
    AnalysisInscriptionUsecase,
    UpdateStatusInscriptionUsecase,
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,
    FindDetailsInscriptionAvulUsecase,
    FindDetailsGuestInscriptionUsecase,
    FindAllWithParticipantsUsecase,

    // Updates
    UpdateInscriptionUsecase,
    UpdateGuestInscriptionUsecase,
    UpdateValidateInscriptionUsecase,

    // Inscription PDF
    GeneratePdfInscriptionUsecase,
    GeneratePdfSelectedInscriptionUsecase,
    GeneratePdfAllInscriptionsUsecase,

    // Payment
    ListAllPaymentsUseCase,
    ListAllPaymentsPendingUsecase,
    ListPaymentPendingDetailsUsecase,
    RegisterPaymentCredUsecase,
    RegisterPaymentPixUsecase,
    DeletePaymentUsecase,
    AnalysisPaymentsPendingUsecase,
    PaymentsDetailsUsecase,
    ApprovePaymentUsecase,
    RejectedPaymentUsecase,
    ReversePaymentUsecase,

    // Payement - Updates
    UpdatePaymentReceiptUsecase,

    //ASAAS
    ConfirmPaymentUsecase,
    PaymentReceivedUsecase,
    PaymentCanceledUseCase,
    PaymentReprovedUsecase,

    // Participants
    ListParticipantsUsecase,
    ListGuestParticipantsUsecase,
    UpdateParticipantsUsecase,
    DeleteParticipantsUsecase,
    GeneratePdfParticipantsSelectedAccountsUsecase,
    GeneratePdfParticipantsAllUsecase,
    GeneratePdfEtiquetaUseCase,

    // Tickets
    CreateTicketUsecase,
    FindAllTicketsUsecase,
    FindTicketsForSaleUsecase,
    AnalysisPreSaleUseCase,
    FindAllListPreSaleUsecase,
    ApprovePreSaleUseCase,
    RejectPreSaleUseCase,
    FindTicketDetailsUsecase,
    SaleTicketUsecase,
    PreSaleUseCase,
    GenerateTicketPdfSecondCopyUsecase,
    SaleGrupUsecase,

    // Event Expenses
    CreateEventExpensesUsecase,
    FindAllPaginatedEventExpensesUsecase,

    // Reports
    ReportGeneralUsecase,
    GeneratePdfGeneralReportUsecase,
    ReportFinancialUsecase,
    GeneratePdfFinancialReportUsecase,

    // Background tasks
    CancelExpiredInscriptionsUseCase,
    CleanupGuestInscriptionUsecase,
    CleanupExpiredCacheUsecase,
    FinalizeExpiredEventsUsecase,
    CleanupCancelledTicketSalesUsecase,
  ],
})
export class UsecaseModule {}
