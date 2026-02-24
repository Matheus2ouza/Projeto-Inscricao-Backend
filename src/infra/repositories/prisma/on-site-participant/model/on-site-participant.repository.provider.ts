import { Provider } from '@nestjs/common';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteParticipantPrismaRepository } from '../on-site-participant.prisma.repository';

export const OnSiteParticipantPrismaRepositoryProvider: Provider = {
  provide: OnSiteParticipantGateway,
  useClass: OnSiteParticipantPrismaRepository,
};
