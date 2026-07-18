import { AccountLocality } from 'src/domain/entities/account-locality/account-locality.entity';
import AccountLocalityPrismaModel from '../account-locality.prisma.model';

export class AccountLocalityPrismaModelToAccountLocalityEntityMapper {
  public static map(
    accountLocality: AccountLocalityPrismaModel,
  ): AccountLocality {
    return AccountLocality.with({
      id: accountLocality.id,
      accountId: accountLocality.accountId,
      localityId: accountLocality.localityId,
      createdAt: accountLocality.createdAt,
    });
  }
}
