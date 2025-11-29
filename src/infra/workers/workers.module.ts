import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { CleanupExpiredCacheTask } from './tasks/cleanup-expired-cache.task';
import { CleanupCancelledTicketSalesTask } from './tasks/cleanup-cancelled-ticket-sales.task';
import { FinalizeExpiredEventsTask } from './tasks/finalize-expired-events.task';

@Module({
  imports: [UsecaseModule],
  providers: [
    CleanupExpiredCacheTask,
    FinalizeExpiredEventsTask,
    CleanupCancelledTicketSalesTask,
  ],
  exports: [
    CleanupExpiredCacheTask,
    FinalizeExpiredEventsTask,
    CleanupCancelledTicketSalesTask,
  ],
})
export class WorkersModule {}
