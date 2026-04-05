import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from '../repositories/prisma/prisma.service';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [HttpModule],
  controllers: [SyncController],
  providers: [SyncService, PrismaService],
  exports: [SyncService, PrismaService],
})
export class SyncModule {}
