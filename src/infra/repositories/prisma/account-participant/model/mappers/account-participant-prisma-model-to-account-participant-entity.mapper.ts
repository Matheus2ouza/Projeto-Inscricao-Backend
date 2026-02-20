import { AccountParticipant } from 'src/domain/entities/account-participant.entity';
import AccountParticipantPrismaModel from '../account-participant.prisma.model';

export class AccountParticipantPrismaModelToAccountParticipantEntityMapper {
  public static map(
    accountParticipant: AccountParticipantPrismaModel & {
      eventLinks?: { id: string }[];
    },
  ): AccountParticipant {
    return AccountParticipant.with({
      id: accountParticipant.id,
      accountId: accountParticipant.accountId,
      name: accountParticipant.name,
      birthDate: new Date(accountParticipant.birthDate),
      preferredName: accountParticipant.preferredName ?? undefined,
      shirtSize: accountParticipant.shirtSize ?? undefined,
      shirtType: accountParticipant.shirtType ?? undefined,
      gender: accountParticipant.gender,
      createdAt: accountParticipant.createdAt,
      updatedAt: accountParticipant.updatedAt,
      isRegistered:
        accountParticipant.eventLinks &&
        accountParticipant.eventLinks.length > 0,
    });
  }
}
