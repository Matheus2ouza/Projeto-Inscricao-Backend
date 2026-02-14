import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CleanupGuestInscriptionUsecase } from 'src/usecases/worker/cleanup-guest-inscription/cleanup-guest-inscription.usecase';

@Injectable()
export class CleanupGuestInscriptionTask
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CleanupGuestInscriptionTask.name);
  private intervalId: NodeJS.Timeout | null = null;

  // Executa a cada 15 minutos (900000ms)
  // Pode ser ajustado conforme necessário
  private readonly CLEANUP_INTERVAL_MS = 60 * 15 * 1000;

  constructor(
    private readonly cleanupGuestInscriptionUsecase: CleanupGuestInscriptionUsecase,
  ) {}

  onModuleInit() {
    this.logger.log('Iniciando task de limpeza de inscrições de convidados...');

    // Executa imediatamente na inicialização
    this.executeCleanup();

    // Configura execução periódica
    this.intervalId = setInterval(() => {
      this.executeCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    this.logger.log(
      `Task de limpeza configurada para executar a cada ${this.CLEANUP_INTERVAL_MS / 1000 / 60} minutos`,
    );
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log('Task de limpeza de inscrições de convidados parada');
    }
  }

  private async executeCleanup() {
    try {
      this.logger.log(
        'Executando limpeza de inscrições de convidados expiradas...',
      );
      const result = await this.cleanupGuestInscriptionUsecase.execute();

      if (result.cleanedCount > 0) {
        this.logger.log(
          `${result.cleanedCount} inscrição(ões) removida(s): ${result.inscriptionsDeleted
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
