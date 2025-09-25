import Decimal from 'decimal.js';
import { User } from 'src/domain/entities/user.entity';
import UserPrismaModal from '../user.prisma.model';

export class UserEntityToUserPrismaModalMapper {
  public static map(user: User): UserPrismaModal {
    const aModal: UserPrismaModal = {
      id: user.getId(),
      username: user.getUsername(),
      outstandingBalance: new Decimal(user.getOutstandingBalance()),
      password: user.getPassword(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    return aModal;
  }
}
