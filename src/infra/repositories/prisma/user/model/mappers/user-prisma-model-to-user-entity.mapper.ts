import { User } from 'src/domain/entities/user.entity';
import UserPrismaModel from '../user.prisma.model';

export class UserPrismaModelToUserEntityMapper {
  public static map(
    user: UserPrismaModel & { region?: { name: string } | null },
  ): User {
    const anUser = User.with({
      id: user.id,
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      regionId: user.regionId ?? undefined,
      regionName: user.region?.name,
    });

    return anUser;
  }
}
