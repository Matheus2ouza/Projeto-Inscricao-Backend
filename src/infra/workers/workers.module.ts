import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { CleanupExpiredCacheTask } from './tasks/cleanup-expired-cache.task';
import { FinalizeExpiredEventsTask } from './tasks/finalize-expired-events.task';

@Module({
  imports: [UsecaseModule],
  providers: [CleanupExpiredCacheTask, FinalizeExpiredEventsTask],
  exports: [CleanupExpiredCacheTask, FinalizeExpiredEventsTask],
})
export class WorkersModule {}
