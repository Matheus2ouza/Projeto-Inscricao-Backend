import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteParticipantPrismaRepository } from '../on-site-participant.prisma.repository';

export const OnSiteParticipantPrismaRepositoryProvider = {
  provide: OnSiteParticipantGateway,
  useClass: OnSiteParticipantPrismaRepository,
};
