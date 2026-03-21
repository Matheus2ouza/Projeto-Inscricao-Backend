import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CancelExpiredGuestInscriptionsUsecase } from 'src/usecases/worker/cancel-expired-guest-inscriptions/cancel-expired-guest-inscriptions.usecase';

@Injectable()
export class CancelExpiredGuestInscriptionsTask {
  private readonly logger = new Logger(CancelExpiredGuestInscriptionsTask.name);

  public constructor(
    private readonly cancelExpiredGuestInscriptionsUsecase: CancelExpiredGuestInscriptionsUsecase,
  ) {}

  // Executa a cada 30 minutos
  @Cron(CronExpression.EVERY_30_MINUTES, {
    timeZone: 'America/Sao_Paulo',
  })
  public async executeCancel() {
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
