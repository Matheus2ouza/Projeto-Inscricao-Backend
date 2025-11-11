import { Module } from '@nestjs/common';
import { WorkersModule } from 'src/infra/workers/workers.module';

@Module({
  imports: [WorkersModule],
})
export class WorkerModule {}
