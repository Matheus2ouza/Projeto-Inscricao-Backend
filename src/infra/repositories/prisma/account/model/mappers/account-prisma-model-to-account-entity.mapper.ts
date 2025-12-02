import { Account } from 'src/domain/entities/account.entity';
import AccountPrismaModel from '../account.prisma.model';

export class AccountPrismaModelToUserEntityMapper {
  public static map(
    user: AccountPrismaModel & { region?: { name: string } | null },
  ): Account {
    const anUser = Account.with({
      id: user.id,
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      regionId: user.regionId ?? undefined,
      regionName: user.region?.name,
      email: user.email ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
    });

    return anUser;
  }
}
