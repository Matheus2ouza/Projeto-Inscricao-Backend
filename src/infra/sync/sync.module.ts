import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProcessSyncQueuesUsecase } from 'src/infra/workers/process-sync-queues/process-sync-queues.usecase';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { RedisModule } from '../services/redis/redis.module';
import { SyncController } from './sync.controller';
import { SyncQueue } from './sync.queue';
import { SyncService } from './sync.service';
import { ProcessSyncQueuesTask } from './tasks/process-sync-queues/process-sync-queues.task';

@Module({
  imports: [HttpModule, RedisModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    SyncQueue,
    PrismaService,
    ProcessSyncQueuesTask,
    ProcessSyncQueuesUsecase,
  ],
  exports: [SyncService, SyncQueue],
})
export class SyncModule {}
