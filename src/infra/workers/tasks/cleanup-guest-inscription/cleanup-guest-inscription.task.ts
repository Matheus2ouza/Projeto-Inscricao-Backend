import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanupGuestInscriptionUsecase } from 'src/usecases/worker/cleanup-guest-inscription/cleanup-guest-inscription.usecase';

@Injectable()
export class CleanupGuestInscriptionTask {
  private readonly logger = new Logger(CleanupGuestInscriptionTask.name);

  constructor(
    private readonly cleanupGuestInscriptionUsecase: CleanupGuestInscriptionUsecase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/Sao_Paulo',
  })
  public async executeCleanup() {
    try {
      this.logger.log(
        'Executando limpeza de inscrições de convidados expiradas... Horario: ' +
          new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
          }),
      );
      const result = await this.cleanupGuestInscriptionUsecase.execute();

      if (result.cleanedCount > 0) {
        this.logger.log(
          `${result.cleanedCount} inscrição(ões) guest removida(s): ${result.inscriptionsDeleted
            .map((i) => `${i.guestName} (${i.id})`)
            .join(', ')}`,
        );
      } else {
        this.logger.debug(
          'Nenhuma inscrição de convidado expirada para remover',
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao executar limpeza de inscrições de convidados: ${error.message}`,
        error.stack,
      );
    }
  }
}
