import { Provider } from '@nestjs/common';
import { ExclusiveInscriptionLinkTypeGateway } from 'src/domain/repositories/exclusive-inscription-link-type.gateway';
import { ExclusiveInscriptionLinkTypePrismaRepository } from '../exclusive-inscription-link-type.prisma.repository';

export const ExclusiveInscriptionLinkTypePrismaRepositoryProvider: Provider = {
  provide: ExclusiveInscriptionLinkTypeGateway,
  useClass: ExclusiveInscriptionLinkTypePrismaRepository,
};
