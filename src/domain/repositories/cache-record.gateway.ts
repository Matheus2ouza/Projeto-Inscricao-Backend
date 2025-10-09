import { CacheRecord } from '../entities/cache-record.entity';

export abstract class CacheRecordGateway {
  abstract create(cacheRecord: CacheRecord): Promise<CacheRecord>;
  abstract findByCacheKey(cacheKey: string): Promise<CacheRecord | null>;
  abstract deleteByCacheKey(cacheKey: string): Promise<void>;
  abstract deleteExpired(): Promise<number>; // retorna número de registros deletados
}
