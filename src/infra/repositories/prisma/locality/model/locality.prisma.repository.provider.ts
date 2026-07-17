import { Provider } from '@nestjs/common';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { LocalityPrismaRepository } from '../locality.prisma.repository';

export const LocalityPrismaRepositoryProvider: Provider = {
  provide: LocalityGateway,
  useClass: LocalityPrismaRepository,
};
