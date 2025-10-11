import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { ImageOptimizerModule } from 'src/infra/services/image-optimizer/image-optimizer.module';
import { ServiceModule } from 'src/infra/services/service.module';
import { SupabaseModule } from 'src/infra/services/supabase/supabase.module';
import { CreateEventUseCase } from './event/create/create-event.usecase';
import { FindAllPaginatedEventsUsecase } from './event/findAllEvent/find-all-paginated-events.usecase';
import { FindByIdEventUsecase } from './event/findById/find-by-id.usecase';
import { UploadEventImageUsecase } from './event/upload-image/upload-event-image.usecase';
import { FindAllPaginatedInscriptionsUsecase } from './inscription/findAllInscription/find-all-paginated-inscription.usecase';
import { ConfirmGroupUsecase } from './inscription/group/confirm-group.usecase';
import { FindCacheGroupUsecase } from './inscription/group/find-cache-group.usecase';
import { UploadValidateGroupUsecase } from './inscription/group/upload-validate-group.usecase';
import { IndivConfirmUsecase } from './inscription/indiv/confirm-indiv.usecase';
import { UploadValidateIndivUsecase } from './inscription/indiv/upload-valide-indiv.usecase';
import { CreateRegionUseCase } from './region/create/create-region.usecase';
import { FindAllPaginatedRegionsUsecase } from './region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllRegionNamesUsecase } from './region/findAllRegionNames/find-all-region-names.usecase';
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
    UploadEventImageUsecase,
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
    UploadEventImageUsecase,
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
  ],
})
export class UsecaseModule {}
