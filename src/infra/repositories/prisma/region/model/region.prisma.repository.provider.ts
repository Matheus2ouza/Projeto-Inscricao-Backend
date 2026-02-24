import { Provider } from '@nestjs/common';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { RegionPrismaRepository } from '../region.prisma.repository';

export const RegionPrismaRepositoryProvider: Provider = {
  provide: RegionGateway,
  useClass: RegionPrismaRepository,
};
