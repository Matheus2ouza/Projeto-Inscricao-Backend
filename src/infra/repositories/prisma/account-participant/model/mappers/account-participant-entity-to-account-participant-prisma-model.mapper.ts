import { AccountParticipant } from 'src/domain/entities/account-participant.entity';
import AccountParticipantPrismaModel from '../account-participant.prisma.model';

export class AccountParticipantEntityToAccountParticipantPrismaModelMapper {
  public static map(
    accountParticipant: AccountParticipant,
  ): AccountParticipantPrismaModel {
    return {
      id: accountParticipant.getId(),
      accountId: accountParticipant.getAccountId(),
      name: accountParticipant.getName(),
      birthDate: accountParticipant.getBirthDate(),
      preferredName: accountParticipant.getPreferredName() ?? null,
      shirtSize: accountParticipant.getShirtSize() ?? null,
      shirtType: accountParticipant.getShirtType() ?? null,
      gender: accountParticipant.getGender(),
      createdAt: accountParticipant.getCreatedAt(),
      updatedAt: accountParticipant.getUpdatedAt(),
    };
  }
}
