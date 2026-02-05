import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { ServiceModule } from '../services/service.module';
import { CleanupCancelledTicketSalesTask } from './tasks/cleanup-cancelled-ticket-sales.task';
import { CleanupExpiredCacheTask } from './tasks/cleanup-expired-cache.task';
import { CleanupGuestInscriptionTask } from './tasks/cleanup-guest-inscription.task';
import { FinalizeExpiredEventsTask } from './tasks/finalize-expired-events.task';

@Module({
  imports: [UsecaseModule, ServiceModule],
  providers: [
    CleanupExpiredCacheTask,
    FinalizeExpiredEventsTask,
    CleanupGuestInscriptionTask,
    CleanupCancelledTicketSalesTask,
  ],
  exports: [
    CleanupExpiredCacheTask,
    FinalizeExpiredEventsTask,
    CleanupGuestInscriptionTask,
    CleanupCancelledTicketSalesTask,
  ],
})
export class WorkersModule {}
