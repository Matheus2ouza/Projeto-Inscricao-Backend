import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { FinalizeExpiredEventsUsecase } from 'src/usecases/worker/finalize-expired-events/finalize-expired-events.usecase';

@Injectable()
export class FinalizeExpiredEventsTask
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(FinalizeExpiredEventsTask.name);
  private intervalId: NodeJS.Timeout | null = null;

  // Executa a cada 1 hora (3600000ms)
  // Pode ser ajustado conforme necessário
  private readonly FINALIZE_INTERVAL_MS = 60 * 60 * 1000;

  constructor(
    private readonly finalizeExpiredEventsUsecase: FinalizeExpiredEventsUsecase,
  ) {}

  onModuleInit() {
    this.logger.log('Iniciando task de finalização de eventos expirados...');

    // Executa imediatamente na inicialização
    this.executeFinalization();

    // Configura execução periódica
    this.intervalId = setInterval(() => {
      this.executeFinalization();
    }, this.FINALIZE_INTERVAL_MS);

    this.logger.log(
      `Task de finalização configurada para executar a cada ${this.FINALIZE_INTERVAL_MS / 1000 / 60} minutos`,
    );
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log('Task de finalização de eventos expirados parada');
    }
  }

  private async executeFinalization() {
    try {
      this.logger.log('Executando finalização de eventos expirados...');
      const result = await this.finalizeExpiredEventsUsecase.execute();

      if (result.finalizedCount > 0) {
        this.logger.log(
          `${result.finalizedCount} evento(s) finalizado(s): ${result.finalizedEvents.join(', ')}`,
        );
      } else {
        this.logger.debug('Nenhum evento expirado para finalizar');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao executar finalização de eventos expirados: ${error.message}`,
        error.stack,
      );
    }
  }
}

