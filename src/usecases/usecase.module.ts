import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ImageOptimizerModule } from 'src/infra/services/image-optimizer/image-optimizer.module';
import { MailModule } from 'src/infra/services/mail/mail.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { SupabaseModule } from 'src/infra/services/supabase/supabase.module';
import { CreateEventExpensesUsecase } from './event-expenses/create/create-event-expenses.usecase';
import { FindAllPaginatedEventExpensesUsecase } from './event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import { ListInscriptionToAnalysisUsecase } from './event/analysis/list-inscription-to-analysis/list-Inscription-to-analysis.usecase';
import { CreateEventUseCase } from './event/create/create-event.usecase';
import { FindAllPaginatedEventsUsecase } from './event/find-all-event/find-all-paginated-events.usecase';
import { FindAllnamesEventUsecase } from './event/find-all-names/find-all-names.usecase';
import { FindAllPaginatedEventToInscriptionUsecase } from './event/find-all-to-analysis/inscriptions/find-all-paginated-events.usecase';
import { FindEventCarouselUsecase } from './event/find-event-carousel/find-event-carousel.usecase';
import { FindByIdEventUsecase } from './event/findById/find-by-id.usecase';
import { UpdateInscriptionEventUsecase } from './event/update-inscription/update-inscription-event.usecase';
import { UpdatePaymentEventUsecase } from './event/update-payment/update-payment.usecase';
import { AnalysisInscriptionUsecase } from './inscription/analysis/analysis-inscription/analysis-inscription.usecase';
import { UpdateStatusInscriptionUsecase } from './inscription/analysis/update-status-inscription/update-status-inscription.usecase';
import { CreateInscriptionAvulUsecase } from './inscription/avul/create/create-inscription-avul.usecase';
import { FindAllPaginatedOnSiteRegistrationUsecase } from './inscription/avul/findAll/find-all-paginated-onsite-registration.usecase';
import { DeleteInscriptionUsecase } from './inscription/delete-inscription/delete-inscription.usecase';
import { FindAllPaginatedInscriptionsUsecase } from './inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import { FindDetailsInscriptionUsecase } from './inscription/find-details-inscription/find-details-inscription.usecase';
import { ConfirmGroupUsecase } from './inscription/group/confirm-group.usecase';
import { FindCacheGroupUsecase } from './inscription/group/find-cache-group.usecase';
import { UploadValidateGroupUsecase } from './inscription/group/upload-validate-group.usecase';
import { IndivConfirmUsecase } from './inscription/indiv/confirm-indiv.usecase';
import { UploadValidateIndivUsecase } from './inscription/indiv/upload-valide-indiv.usecase';
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
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,
    ListInscriptionToAnalysisUsecase,
    FindAllPaginatedEventToInscriptionUsecase,

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

    //InscriptionGroup
    UploadValidateGroupUsecase,
    ConfirmGroupUsecase,
    FindCacheGroupUsecase,

    //InscriptionIndiv
    UploadValidateIndivUsecase,
    IndivConfirmUsecase,

    //Analysis - Inscription
    AnalysisInscriptionUsecase,
    UpdateStatusInscriptionUsecase,

    //InscriptionAvul
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,

    //PaymentInscription
    CreatePaymentInscriptionUsecase,

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
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,
    ListInscriptionToAnalysisUsecase,
    FindAllPaginatedEventToInscriptionUsecase,

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

    //InscriptionGroup
    UploadValidateGroupUsecase,
    ConfirmGroupUsecase,
    FindCacheGroupUsecase,

    //InscriptionIndiv
    UploadValidateIndivUsecase,
    IndivConfirmUsecase,

    //Analysis - Inscription
    AnalysisInscriptionUsecase,
    UpdateStatusInscriptionUsecase,

    //InscriptionAvul
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,

    //PaymentInscription
    CreatePaymentInscriptionUsecase,

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
