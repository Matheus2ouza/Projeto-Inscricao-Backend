import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SYNC_TABLE_CONFIG_BY_TABLE } from 'src/infra/sync/sync.config';
import { SyncQueue } from 'src/infra/sync/sync.queue';
import { SyncJob } from 'src/infra/sync/sync.types';
import { Usecase } from 'src/usecases/usecase';

export type ProcessSyncQueuesOutput = {
  synced: number;
  failed: number;
  retried: number;
  waitingDependencies: number;
  recovered: number;
};

@Injectable()
export class ProcessSyncQueuesUsecase
  implements Usecase<void, ProcessSyncQueuesOutput>
{
  private readonly logger = new Logger(ProcessSyncQueuesUsecase.name);
  private readonly cloudUrl = process.env.SYNC_API_URL;
  private readonly syncSecret = process.env.SYNC_SECRET;

  private readonly batchSize = 25;
  private readonly maxAttempts = 5;
  private readonly processingTimeoutMs = 5 * 60 * 1000;
  private readonly processingLockTtlSeconds = 5 * 60;
  private readonly backoffMs = [1_000, 5_000, 30_000, 120_000, 600_000];

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncQueue: SyncQueue,
    private readonly httpService: HttpService,
  ) {}

  async execute(): Promise<ProcessSyncQueuesOutput> {
    // Health check a cada 100 execucoes (opcional)
    if (this.shouldRunHealthCheck()) {
      const health = await this.syncQueue.healthCheck();
      if (!health.isHealthy) {
        this.logger.warn(`Health check issues: ${health.issues.join(', ')}`);
        await this.syncQueue.reconcilePendingQueue();
      }
    }

    const output: ProcessSyncQueuesOutput = {
      synced: 0,
      failed: 0,
      retried: 0,
      waitingDependencies: 0,
      recovered: await this.syncQueue.recoverStaleProcessing(
        this.processingTimeoutMs,
      ),
    };

    const jobs = await this.syncQueue.getDuePendingJobs(this.batchSize);

    for (const job of jobs) {
      const processingJob = await this.syncQueue.acquireForProcessing(
        job,
        this.processingLockTtlSeconds,
      );

      if (!processingJob) continue;

      // Status agora vem exclusivamente do JSON do job
      // Não há mais inferência de estado via Redis keys
      const result = await this.processJob(processingJob);
      output.synced += result.synced;
      output.failed += result.failed;
      output.retried += result.retried;
      output.waitingDependencies += result.waitingDependencies;
    }

    return output;
  }

  private healthCheckCounter = 0;
  private shouldRunHealthCheck(): boolean {
    this.healthCheckCounter++;
    if (this.healthCheckCounter >= 100) {
      this.healthCheckCounter = 0;
      return true;
    }
    return false;
  }

  private async processJob(job: SyncJob): Promise<ProcessSyncQueuesOutput> {
    const emptyResult: ProcessSyncQueuesOutput = {
      synced: 0,
      failed: 0,
      retried: 0,
      waitingDependencies: 0,
      recovered: 0,
    };

    // Config vem da tabela de configuração (não usa Redis)
    const config = SYNC_TABLE_CONFIG_BY_TABLE.get(job.table);

    if (!config) {
      await this.syncQueue.markFailed(job, `Config de sync nao encontrada`);
      return { ...emptyResult, failed: 1 };
    }

    try {
      // Buscar registro no banco local
      const record = await (this.prisma as any)[config.prismaModel].findUnique({
        where: { id: job.recordId },
      });

      if (!record) {
        await this.syncQueue.markFailed(
          job,
          `Registro local nao encontrado: ${job.table}:${job.recordId}`,
        );
        return { ...emptyResult, failed: 1 };
      }

      // Dependências usam apenas cache opcional (syncedKey)
      // Não definem estado, apenas verificam disponibilidade
      const dependencies = config.getDependencies?.(record) ?? [];
      const dependenciesReady =
        await this.syncQueue.areDependenciesSynced(dependencies);

      if (!dependenciesReady) {
        // MarkPending atualiza apenas o JSON e a fila
        await this.syncQueue.markPending(job, 'Dependencias pendentes');
        this.logger.log(
          `Sync aguardando dependencias job=${job.id} table=${job.table} recordId=${job.recordId}`,
        );
        return { ...emptyResult, waitingDependencies: 1 };
      }

      // Executar sync com cloud
      await firstValueFrom(
        this.httpService.post(
          `${this.cloudUrl}/sync/${job.table}`,
          { record },
          { headers: { 'x-sync-token': this.syncSecret }, timeout: 10_000 },
        ),
      );

      // MarkSynced atualiza JSON para 'synced' e limpa caches
      await this.syncQueue.markSynced(job);
      this.logger.log(
        `Sync concluido job=${job.id} table=${job.table} recordId=${job.recordId}`,
      );

      return { ...emptyResult, synced: 1 };
    } catch (error) {
      // Tratamento específico para conflito (409 - já existe)
      if (isAxiosError(error) && error.response?.status === 409) {
        // Mesmo em caso de conflito, marcamos como synced (já existe na cloud)
        await this.syncQueue.markSynced(job);
        this.logger.warn(
          `Sync idempotente job=${job.id} table=${job.table} recordId=${job.recordId} status=already_exists`,
        );
        return { ...emptyResult, synced: 1 };
      }

      const errorMessage = this.getErrorMessage(error);

      // Verificar se excedeu tentativas máximas
      if (job.attempts + 1 >= this.maxAttempts) {
        await this.syncQueue.markFailed(job, errorMessage);
        this.logger.error(
          `Sync falhou definitivamente job=${job.id} table=${job.table} recordId=${job.recordId} attempts=${job.attempts + 1} error=${errorMessage}`,
        );
        return { ...emptyResult, failed: 1 };
      }

      // Agendar retry (atualiza JSON com nova data e mantém status 'pending')
      const nextRetryAt = this.calculateNextRetryAt(job.attempts);
      await this.syncQueue.markRetry(job, nextRetryAt, errorMessage);
      this.logger.warn(
        `Sync reagendado job=${job.id} table=${job.table} recordId=${job.recordId} attempts=${job.attempts + 1} nextRetryAt=${nextRetryAt.toISOString()} error=${errorMessage}`,
      );

      return { ...emptyResult, retried: 1 };
    }
  }

  private calculateNextRetryAt(attempts: number): Date {
    const delay = this.backoffMs[Math.min(attempts, this.backoffMs.length - 1)];
    return new Date(Date.now() + delay);
  }

  private getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
      return error.response?.data?.message ?? error.message;
    }

    if (error instanceof Error) return error.message;

    return 'Erro desconhecido';
  }
}
