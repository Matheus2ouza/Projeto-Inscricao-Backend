import { Provider } from '@nestjs/common';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountParticipantPrismaRepository } from '../account-participant.prisma.repository';

export const AccountParticipantPrismaRepositoryProvider: Provider = {
  provide: AccountParticipantGateway,
  useClass: AccountParticipantPrismaRepository,
};
