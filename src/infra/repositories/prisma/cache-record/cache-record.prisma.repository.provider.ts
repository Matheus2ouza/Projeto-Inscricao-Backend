import { Provider } from '@nestjs/common';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { CacheRecordPrismaRepository } from './cache-record.prisma.repository';

export const CacheRecordRepositoryProvider: Provider = {
  provide: CacheRecordGateway,
  useClass: CacheRecordPrismaRepository,
};
