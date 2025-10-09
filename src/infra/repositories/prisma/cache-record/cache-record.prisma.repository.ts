import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { CacheRecord } from 'src/domain/entities/cache-record.entity';
import { CacheRecordPrismaModelToCacheRecordEntityMapper } from './model/mappers/cache-record-prisma-model-to-cache-record-entity.mapper';

@Injectable()
export class CacheRecordPrismaRepository implements CacheRecordGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(cacheRecord: CacheRecord): Promise<CacheRecord> {
    const data = {
      id: cacheRecord.getId(),
      cacheKey: cacheRecord.getCacheKey(),
      payload: cacheRecord.getPayload(),
      accountId: cacheRecord.getAccountId(),
      expiresAt: cacheRecord.getExpiresAt() ?? null,
    };
    const created = await this.prisma.cacheRecords.create({ data });

    return CacheRecordPrismaModelToCacheRecordEntityMapper.map(created);
  }

  async findByCacheKey(cacheKey: string): Promise<CacheRecord | null> {
    const found = await this.prisma.cacheRecords.findUnique({
      where: { cacheKey },
    });

    if (!found) return null;

    return CacheRecordPrismaModelToCacheRecordEntityMapper.map(found);
  }

  async deleteByCacheKey(cacheKey: string): Promise<void> {
    await this.prisma.cacheRecords.delete({
      where: { cacheKey },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.cacheRecords.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
