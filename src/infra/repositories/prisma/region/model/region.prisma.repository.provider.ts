import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { RegionPrismaRepository } from '../region.prisma.repository';

export const RegionPrismaRepositoryProvider = {
  provide: RegionGateway,
  useClass: RegionPrismaRepository,
};
