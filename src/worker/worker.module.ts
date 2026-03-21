import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkersModule } from 'src/infra/workers/workers.module';

@Module({
  imports: [ScheduleModule.forRoot(), WorkersModule],
})
export class WorkerModule {}
