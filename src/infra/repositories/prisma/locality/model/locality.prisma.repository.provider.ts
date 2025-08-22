import { LocalityGateway } from 'src/domain/repositories/locality.geteway';
import { LocalityPrismaRepository } from '../locality.prisma.repository';

export const LocalityPrismaRepositoryProvider = {
  provide: LocalityGateway,
  useClass: LocalityPrismaRepository,
};
