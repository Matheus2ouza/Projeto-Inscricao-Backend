import { Injectable } from '@nestjs/common';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { RedisService } from 'src/infra/services/redis/redis.service';

export type GroupCancelInput = {
  cacheKey: string;
  accountId: string;
};

@Injectable()
export class GroupCancelUsecase {
  public constructor(
    private readonly redis: RedisService,
    private readonly cacheRecordGateway: CacheRecordGateway,
  ) {}

  async execute(input: GroupCancelInput): Promise<void> {
    // Primeiro tenta buscar no banco de dados
    const cacheRecord = await this.cacheRecordGateway.findByCacheKey(
      input.cacheKey,
    );

    if (cacheRecord) {
      // Verificar se o cache pertence ao usuário
      if (cacheRecord.getAccountId() !== input.accountId) {
        throw new Error('Acesso negado ao cache');
      }

      // Verificar se o cache expirou (mesmo expirado, podemos remover)
      if (cacheRecord.isExpired()) {
        await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);
        await this.redis.del(input.cacheKey);
        return;
      }

      // Remove do cache (banco e Redis)
      await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);
      await this.redis.del(input.cacheKey);
    } else {
      // Fallback: tenta remover do Redis mesmo se não encontrar no banco
      await this.redis.del(input.cacheKey);
    }
  }
}
