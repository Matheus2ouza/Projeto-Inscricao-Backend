import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CancelExpiredGuestInscriptionsUsecase } from 'src/usecases/worker/cancel-expired-guest-inscriptions/cancel-expired-guest-inscriptions.usecase';

@Injectable()
export class CancelExpiredGuestInscriptionsTask
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CancelExpiredGuestInscriptionsTask.name);
  private intervalId: NodeJS.Timeout | null = null;
  // Intervalo de execução (30 minutos)
  private readonly CANCEL_INTERVAL_MS = 30 * 60 * 1000;

  public constructor(
    private readonly cancelExpiredGuestInscriptionsUsecase: CancelExpiredGuestInscriptionsUsecase,
  ) {}

  onModuleInit() {
    this.logger.log(
      'Iniciando task de cancelamento de inscrições expiradas...',
    );

    // Executa imediatamente na inicialização
    this.executeCancel();

    // Agenda execução recorrente
    this.intervalId = setInterval(() => {
      this.executeCancel();
    }, this.CANCEL_INTERVAL_MS);

    this.logger.log(
      `Task configurada para executar a cada ${this.CANCEL_INTERVAL_MS / 1000 / 60} minutos`,
    );
  }

  onModuleDestroy() {
    if (this.intervalId) {
      // Encerra o agendamento quando o módulo é destruído
      clearInterval(this.intervalId);
      this.logger.log('Task de cancelamento de inscrições expiradas parada');
    }
  }

  private async executeCancel() {
    try {
      // Executa o usecase e registra o resultado
      const result = await this.cancelExpiredGuestInscriptionsUsecase.execute();
      if (result.countInscriptionsCancelled > 0) {
        this.logger.log(
          `Inscrições Guest canceladas: ${result.countInscriptionsCancelled}`,
        );
      } else {
        this.logger.log('Nenhuma inscrição Guest expirada para cancelar');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao executar cancelamento de inscrições Guest expiradas: ${error.message}`,
        error.stack,
      );
    }
  }
}
