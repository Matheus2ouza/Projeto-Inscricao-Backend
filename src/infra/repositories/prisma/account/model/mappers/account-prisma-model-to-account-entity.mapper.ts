import { Account } from 'src/domain/entities/account/account.entity';
import AccountPrismaModel from '../account.prisma.model';

export class AccountPrismaModelToUserEntityMapper {
  public static map(user: AccountPrismaModel): Account {
    const anUser = Account.with({
      id: user.id,
      username: user.username,
      password: user.password,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      regionId: user.regionId ?? undefined,
      email: user.email ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    });

    return anUser;
  }
}
