import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { CleanupExpiredCacheTask } from './tasks/cleanup-expired-cache.task';

@Module({
  imports: [UsecaseModule],
  providers: [CleanupExpiredCacheTask],
  exports: [CleanupExpiredCacheTask],
})
export class WorkersModule {}
