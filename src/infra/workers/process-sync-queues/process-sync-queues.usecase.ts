import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import {
  SYNC_TABLES_CONFIG,
  SyncTableConfig,
} from 'src/infra/sync/sync.config';
import { SyncQueue } from 'src/infra/sync/sync.queue';
import { Usecase } from 'src/usecases/usecase';

export type ProcessSyncQueuesOutput = {
  synced: number;
  failed: number;
};

@Injectable()
export class ProcessSyncQueuesUsecase
  implements Usecase<void, ProcessSyncQueuesOutput>
{
  private readonly logger = new Logger(ProcessSyncQueuesUsecase.name);
  private readonly cloudUrl = process.env.SYNC_API_URL;
  private readonly syncSecret = process.env.SYNC_SECRET;

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncQueue: SyncQueue,
    private readonly httpService: HttpService,
  ) {}

  async execute(): Promise<ProcessSyncQueuesOutput> {
    let synced = 0;
    let failed = 0;

    for (const config of SYNC_TABLES_CONFIG) {
      const result = await this.processTable(config);
      synced += result.synced;
      failed += result.failed;
    }

    return { synced, failed };
  }

  private async processTable(
    config: SyncTableConfig,
  ): Promise<ProcessSyncQueuesOutput> {
    const { table, prismaModel } = config;
    let synced = 0;
    let failed = 0;

    const queueSize = await this.syncQueue.size(table);
    if (queueSize === 0) return { synced, failed };

    this.logger.log(`📤 ${table}: ${queueSize} registros na fila`);

    for (let i = 0; i < queueSize; i++) {
      const id = await this.syncQueue.dequeue(table);
      if (!id) break;

      try {
        const record = await (this.prisma as any)[prismaModel].findUnique({
          where: { id },
        });

        if (!record) {
          this.logger.warn(`${table}: registro ${id} não encontrado — pulando`);
          continue;
        }

        await firstValueFrom(
          this.httpService.post(
            `${this.cloudUrl}/sync/${table}`,
            { record },
            {
              headers: { 'x-sync-token': this.syncSecret },
              timeout: 10_000,
            },
          ),
        );

        this.logger.log(`✅ ${table}: ${id} sincronizado`);
        synced++;
      } catch (error) {
        this.logger.warn(
          `❌ ${table}: falha ao sincronizar ${id} — devolvendo para fila`,
        );
        await this.syncQueue.requeue(table, id);
        failed++;
      }
    }

    return { synced, failed };
  }
}
