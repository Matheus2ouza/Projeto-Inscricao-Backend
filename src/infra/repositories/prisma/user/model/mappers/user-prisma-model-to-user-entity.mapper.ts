import { User } from 'src/domain/entities/user.entity';
import UserPrismaModal from '../user.prisma.model';

export class USerPrismaModalToUserEntityMapper {
  public static map(user: UserPrismaModal): User {
    const anUser = User.with({
      id: user.id,
      username: user.username,
      password: user.password,
      outstandingBalance: Number(user.outstandingBalance),
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    return anUser;
  }
}
