import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';
import AccountParticipantInEventPrismaModel from '../account-participant-in-event.prisma.model';

export class AccountParticipantInEventEntityToAccountParticipantInEventPrismaModelMapper {
  public static map(
    accountParticipantInEvent: AccountParticipantInEvent,
  ): AccountParticipantInEventPrismaModel {
    return {
      id: accountParticipantInEvent.getId(),
      accountParticipantId: accountParticipantInEvent.getAccountParticipantId(),
      inscriptionId: accountParticipantInEvent.getInscriptionId(),
      typeInscriptionId: accountParticipantInEvent.getTypeInscriptionId(),
      createdAt: accountParticipantInEvent.getCreatedAt(),
      updatedAt: accountParticipantInEvent.getUpdatedAt(),
    };
  }
}
