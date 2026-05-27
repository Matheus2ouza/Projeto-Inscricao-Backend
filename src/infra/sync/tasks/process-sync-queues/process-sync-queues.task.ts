import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProcessSyncQueuesUsecase } from 'src/infra/workers/process-sync-queues/process-sync-queues.usecase';
import { SyncService } from '../../sync.service';

@Injectable()
export class ProcessSyncQueuesTask {
  private readonly logger = new Logger(ProcessSyncQueuesTask.name);

  constructor(
    private readonly processSyncQueuesUsecase: ProcessSyncQueuesUsecase,
    private readonly syncService: SyncService,
  ) {}

  @Cron('*/15 * * * * *', {
    timeZone: 'America/Sao_Paulo',
  })
  async execute() {
    if (!this.syncService.isOnline) return;

    try {
      const result = await this.processSyncQueuesUsecase.execute();

      if (result.synced > 0 || result.failed > 0) {
        this.logger.log(
          `Sync concluído — sincronizados: ${result.synced} | falhas: ${result.failed}`,
        );
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao executar sync: ${err.message}`, err.stack);
    }
  }
}
