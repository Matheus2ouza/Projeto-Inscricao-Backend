import { Injectable, Logger } from '@nestjs/common';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { RedisService } from 'src/infra/services/redis/redis.service';

@Injectable()
export class CleanupExpiredCacheUsecase {
  private readonly logger = new Logger(CleanupExpiredCacheUsecase.name);

  constructor(
    private readonly cacheRecordGateway: CacheRecordGateway,
    private readonly redis: RedisService,
  ) {}

  async execute(): Promise<{
    redisDeleted: number;
    databaseDeleted: number;
  }> {
    this.logger.log('Iniciando limpeza de caches expirados...');

    // Buscar cacheKeys expirados do banco de dados
    const expiredCacheKeys =
      await this.cacheRecordGateway.findExpiredCacheKeys();

    if (expiredCacheKeys.length === 0) {
      this.logger.log('Nenhum cache expirado encontrado');
      return {
        redisDeleted: 0,
        databaseDeleted: 0,
      };
    }

    this.logger.log(
      `Encontrados ${expiredCacheKeys.length} caches expirados para limpeza`,
    );

    // Deletar do Redis (em lote para melhor performance)
    let redisDeleted = 0;
    try {
      redisDeleted = await this.redis.delMany(expiredCacheKeys);
    } catch (error) {
      this.logger.warn(
        `Erro ao deletar caches do Redis em lote: ${error.message}. Tentando deletar individualmente...`,
      );
      // Fallback: deletar individualmente se houver erro no lote
      for (const cacheKey of expiredCacheKeys) {
        try {
          const deleted = await this.redis.del(cacheKey);
          if (deleted > 0) redisDeleted++;
        } catch (individualError) {
          this.logger.warn(
            `Erro ao deletar cacheKey ${cacheKey} do Redis: ${individualError.message}`,
          );
        }
      }
    }

    // Deletar do banco de dados
    const databaseDeleted = await this.cacheRecordGateway.deleteExpired();

    this.logger.log(
      `Limpeza concluída: ${redisDeleted} deletados do Redis, ${databaseDeleted} deletados do banco de dados`,
    );

    return {
      redisDeleted,
      databaseDeleted,
    };
  }
}
