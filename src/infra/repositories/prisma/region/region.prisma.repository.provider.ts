import { Provider } from '@nestjs/common';
import { RegionPrismaRepository } from './region.prisma.repository';

export const RegionPrismaRepositoryProvider: Provider = {
  provide: 'RegionGateway',
  useClass: RegionPrismaRepository,
};
