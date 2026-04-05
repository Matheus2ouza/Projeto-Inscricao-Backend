import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DataBaseModule } from './infra/repositories/database.module';
import { SyncModule } from './infra/sync/sync.module';
import { WebModule } from './infra/web/web.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.dev', '.env.event', '.env'],
    }),
    ScheduleModule.forRoot(),
    DataBaseModule,
    WebModule,
    ...(process.env.EVENT_MODE === 'true' ? [SyncModule] : []),
  ],
})
export class AppModule {}
