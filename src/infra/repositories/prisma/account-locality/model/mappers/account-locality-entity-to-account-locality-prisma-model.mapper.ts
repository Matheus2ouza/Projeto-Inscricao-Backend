import { AccountLocality } from 'src/domain/entities/account-locality/account-locality.entity';
import AccountLocalityPrismaModel from '../account-locality.prisma.model';

export class AccountLocalityEntityToAccountLocalityPrismaModelMapper {
  public static map(
    accountLocality: AccountLocality,
  ): AccountLocalityPrismaModel {
    return {
      id: accountLocality.getId(),
      accountId: accountLocality.getAccountId(),
      localityId: accountLocality.getLocalityId(),
      createdAt: accountLocality.getCreatedAt(),
    };
  }
}
