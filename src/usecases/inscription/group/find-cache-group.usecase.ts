import { Injectable } from '@nestjs/common';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';

export type FindCacheGroupInput = {
  cacheKey: string;
  accountId: string;
};

export type FindCacheGroupOutput = {
  cacheKey: string;
  payload: any;
};

@Injectable()
export class FindCacheGroupUsecase {
  constructor(private readonly cacheRecordGateway: CacheRecordGateway) {}

  async execute(input: FindCacheGroupInput): Promise<FindCacheGroupOutput> {
    const cacheRecord = await this.cacheRecordGateway.findByCacheKey(
      input.cacheKey,
    );

    if (!cacheRecord) {
      throw new Error('Cache não encontrado ou expirado');
    }

    // Verificar se o cache pertence ao usuário
    if (cacheRecord.getAccountId() !== input.accountId) {
      throw new Error('Acesso negado ao cache');
    }

    // Verificar se o cache expirou
    if (cacheRecord.isExpired()) {
      // Remover cache expirado
      await this.cacheRecordGateway.deleteByCacheKey(input.cacheKey);
      throw new Error('Cache expirado');
    }

    return {
      cacheKey: cacheRecord.getCacheKey(),
      payload: cacheRecord.getPayload(),
    };
  }
}
