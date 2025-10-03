import { RegionPrismaRepository } from './region.prisma.repository';
import { RegionGateway } from 'src/domain/repositories/region.gateway';

export const RegionPrismaRepositoryProvider = {
  provide: RegionGateway,
  useClass: RegionPrismaRepository,
};
