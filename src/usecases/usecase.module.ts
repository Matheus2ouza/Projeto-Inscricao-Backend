import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ImageOptimizerModule } from 'src/infra/services/image-optimizer/image-optimizer.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { SupabaseModule } from 'src/infra/services/supabase/supabase.module';
import { CreateEventExpensesUsecase } from './event-expenses/create/create-event-expenses.usecase';
import { FindAllPaginatedEventExpensesUsecase } from './event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import { CreateEventUseCase } from './event/create/create-event.usecase';
import { FindAllnamesEventUsecase } from './event/find-all-names/find-all-names.usecase';
import { FindEventCarouselUsecase } from './event/find-event-carousel/find-event-carousel.usecase';
import { FindAllPaginatedEventsUsecase } from './event/findAllEvent/find-all-paginated-events.usecase';
import { FindByIdEventUsecase } from './event/findById/find-by-id.usecase';
import { ListInscriptionUsecase } from './event/list-inscription/list-Inscription.usecase';
import { UpdateInscriptionEventUsecase } from './event/update-inscription/update-inscription-event.usecase';
import { UpdatePaymentEventUsecase } from './event/update-payment/update-payment.usecase';
import { AnalysisInscriptionUsecase } from './inscription/analysis-inscription/analysis-inscription.usecase';
import { FindDetailsInscriptionUsecase } from './inscription/find-details-inscription/find-details-inscription.usecase';
import { FindAllPaginatedInscriptionsUsecase } from './inscription/findAllInscription/find-all-paginated-inscription.usecase';
import { ConfirmGroupUsecase } from './inscription/group/confirm-group.usecase';
import { FindCacheGroupUsecase } from './inscription/group/find-cache-group.usecase';
import { UploadValidateGroupUsecase } from './inscription/group/upload-validate-group.usecase';
import { IndivConfirmUsecase } from './inscription/indiv/confirm-indiv.usecase';
import { UploadValidateIndivUsecase } from './inscription/indiv/upload-valide-indiv.usecase';
import { CreateInscriptionAvulUsecase } from './inscriptionAvul/create/create-inscription-avul.usecase';
import { FindAllPaginatedOnSiteRegistrationUsecase } from './inscriptionAvul/findAll/find-all-paginated-onsite-registration.usecase';
import { CreatePaymentInscriptionUsecase } from './paymentInscription/create/create-payment-inscription.usecase';
import { CreateRegionUseCase } from './region/create/create-region.usecase';
import { FindAllPaginatedRegionsUsecase } from './region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllRegionNamesUsecase } from './region/findAllRegionNames/find-all-region-names.usecase';
import { RelatorioGeralUsecase } from './relatorio/geral/relatorio-geral.usecase';
import { GerarPdfRelatorioUsecase } from './relatorio/pdf/gerar-pdf-relatorio.usecase';
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
import { FindUserUsecase } from './user/find-by-id/find-user.usecase';
import { LoginUserUsecase } from './user/login/login-user.usecase';
import { RefreshAuthTokenUserUsecase } from './user/refresh-auth-token/refresh-auth-token-user.usecase';

@Module({
  imports: [
    DataBaseModule,
    ServiceModule,
    SupabaseModule,
    ImageOptimizerModule,
  ],
  providers: [
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    CreateEventUseCase,
    FindAllPaginatedEventsUsecase,
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,
    FindAllPaginatedUsersUsecase,
    FindByIdEventUsecase,
    CreateTypeInscriptionUseCase,
    FindTypeInscriptionByEventIdUsecase,
    UploadValidateGroupUsecase,
    ConfirmGroupUsecase,
    FindCacheGroupUsecase,
    FindAllInscriptionUsecase,
    UploadValidateIndivUsecase,
    IndivConfirmUsecase,
    FindAllPaginatedInscriptionsUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    FindDetailsInscriptionUsecase,
    CreatePaymentInscriptionUsecase,
    CreateEventExpensesUsecase,
    FindAllPaginatedEventExpensesUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,
    ListInscriptionUsecase,
    AnalysisInscriptionUsecase,
    CreateTicketUsecase,
    FindAllTicketsUsecase,
    SaleGroupTicketUsecase,
    SaleTicketUsecase,
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,
    FindTicketDetailsUsecase,
    RelatorioGeralUsecase,
    GerarPdfRelatorioUsecase,
  ],
  exports: [
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    CreateEventUseCase,
    CreateRegionUseCase,
    FindAllRegionNamesUsecase,
    FindAllPaginatedRegionsUsecase,
    FindAllPaginatedUsersUsecase,
    FindAllPaginatedEventsUsecase,
    FindByIdEventUsecase,
    CreateTypeInscriptionUseCase,
    FindTypeInscriptionByEventIdUsecase,
    UploadValidateGroupUsecase,
    ConfirmGroupUsecase,
    FindCacheGroupUsecase,
    FindAllInscriptionUsecase,
    UploadValidateIndivUsecase,
    IndivConfirmUsecase,
    FindAllPaginatedInscriptionsUsecase,
    FindAllnamesEventUsecase,
    FindEventCarouselUsecase,
    FindDetailsInscriptionUsecase,
    CreatePaymentInscriptionUsecase,
    CreateEventExpensesUsecase,
    FindAllPaginatedEventExpensesUsecase,
    UpdatePaymentEventUsecase,
    UpdateInscriptionEventUsecase,
    ListInscriptionUsecase,
    AnalysisInscriptionUsecase,
    CreateTicketUsecase,
    FindAllTicketsUsecase,
    SaleGroupTicketUsecase,
    SaleTicketUsecase,
    CreateInscriptionAvulUsecase,
    FindAllPaginatedOnSiteRegistrationUsecase,
    FindTicketDetailsUsecase,
    RelatorioGeralUsecase,
    GerarPdfRelatorioUsecase,
  ],
})
export class UsecaseModule {}
