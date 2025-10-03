import { User } from 'src/domain/entities/user.entity';
import UserPrismaModel from '../user.prisma.model';

//Conversão de model do prisma para entity
export class UserPrismaModelToUserEntityMapper {
  public static map(user: UserPrismaModel): User {
    const anUser = User.with({
      id: user.id,
      username: user.username,
      password: user.password,
      outstandingBalance: Number(user.outstandingBalance),
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      regionId: user.regionId ?? undefined,
    });

    return anUser;
  }
}
