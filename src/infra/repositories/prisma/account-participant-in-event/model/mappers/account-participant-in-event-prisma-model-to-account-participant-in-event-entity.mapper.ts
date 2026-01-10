import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';
import AccountParticipantInEventPrismaModel from '../account-participant-in-event.prisma.model';

export class AccountParticipantInEventPrismaModelToAccountParticipantInEventEntityMapper {
  public static map(
    accountParticipantInEvent: AccountParticipantInEventPrismaModel,
  ): AccountParticipantInEvent {
    return AccountParticipantInEvent.with({
      id: accountParticipantInEvent.id,
      accountParticipantId: accountParticipantInEvent.accountParticipantId,
      inscriptionId: accountParticipantInEvent.inscriptionId,
      typeInscriptionId: accountParticipantInEvent.typeInscriptionId,
      createdAt: accountParticipantInEvent.createdAt,
      updatedAt: accountParticipantInEvent.updatedAt,
    });
  }
}
