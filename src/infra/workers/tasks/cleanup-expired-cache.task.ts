import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CleanupExpiredCacheUsecase } from 'src/usecases/worker/cache/cleanup-expired-cache/cleanup-expired-cache.usecase';

@Injectable()
export class CleanupExpiredCacheTask implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CleanupExpiredCacheTask.name);
  private intervalId: NodeJS.Timeout | null = null;

  // Executa a cada 1 hora (3600000ms)
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

  constructor(
    private readonly cleanupExpiredCacheUsecase: CleanupExpiredCacheUsecase,
  ) {}

  onModuleInit() {
    this.logger.log('Iniciando task de limpeza de caches expirados...');

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
      this.logger.log('Task de limpeza de caches expirados parada');
    }
  }

  private async executeCleanup() {
    try {
      this.logger.log('Executando limpeza de caches expirados...');
      const result = await this.cleanupExpiredCacheUsecase.execute();

      if (result.redisDeleted > 0 || result.databaseDeleted > 0) {
        this.logger.log(
          `Limpeza concluída: ${result.redisDeleted} deletados do Redis, ${result.databaseDeleted} deletados do banco de dados`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao executar limpeza de caches expirados: ${error.message}`,
        error.stack,
      );
    }
  }
}
