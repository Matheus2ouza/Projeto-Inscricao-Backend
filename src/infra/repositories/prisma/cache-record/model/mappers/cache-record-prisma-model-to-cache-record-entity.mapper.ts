import { CacheRecord } from 'src/domain/entities/cache-record.entity';
import CacheRecordPrismaModel from '../cache-record.prisma.model';

export class CacheRecordPrismaModelToCacheRecordEntityMapper {
  public static map(cacheRecord: CacheRecordPrismaModel): CacheRecord {
    return CacheRecord.with({
      id: cacheRecord.id,
      cacheKey: cacheRecord.cacheKey,
      payload: cacheRecord.payload,
      accountId: cacheRecord.accountId,
      expiresAt: cacheRecord.expiresAt ?? undefined,
      createdAt: cacheRecord.createdAt,
      updatedAt: cacheRecord.updatedAt,
    });
  }
}
