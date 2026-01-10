import { Provider } from '@nestjs/common';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantInEventPrismaRepository } from '../account-participant-in-event.prisma.repository';

export const AccountParticipantInEventPrismaRepositoryProvider: Provider = {
  provide: AccountParticipantInEventGateway,
  useClass: AccountParticipantInEventPrismaRepository,
};
