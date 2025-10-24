import { CacheRecord } from 'src/domain/entities/cache-record.entity';
import CacheRecordPrismaModel from '../cache-record.prisma.model';

export class CacheRecordEntityToCacheRecordPrismaModelMapper {
  public static map(
    cacheRecord: CacheRecord,
  ): Omit<CacheRecordPrismaModel, 'account'> {
    return {
      id: cacheRecord.getId(),
      cacheKey: cacheRecord.getCacheKey(),
      payload: cacheRecord.getPayload(),
      accountId: cacheRecord.getAccountId(),
      expiresAt: cacheRecord.getExpiresAt() ?? null,
      createdAt: cacheRecord.getCreatedAt(),
      updatedAt: cacheRecord.getUpdatedAt(),
    };
  }
}
