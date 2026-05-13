import { Provider } from '@nestjs/common';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { ExclusiveInscriptionLinkPrismaRepository } from '../exclusive-inscription-link.prisma.repository';

export const ExclusiveInscriptionLinkPrismaRepositoryProvider: Provider = {
  provide: ExclusiveInscriptionLinkGateway,
  useClass: ExclusiveInscriptionLinkPrismaRepository,
};
