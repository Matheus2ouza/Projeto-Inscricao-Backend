import { Provider } from '@nestjs/common';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { ParticipantPrismaRepository } from './participant.prisma.repository';

export const ParticipantPrismaRepositoryProvider: Provider = {
  provide: ParticipantGateway,
  useClass: ParticipantPrismaRepository,
};
