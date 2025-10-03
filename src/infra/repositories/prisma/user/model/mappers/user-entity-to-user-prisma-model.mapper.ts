import { User } from 'src/domain/entities/user.entity';
import UserPrismaModel from '../user.prisma.model';

//Conversão de entity para model do prisma
export class UserEntityToUserPrismaModelMapper {
  public static map(user: User): UserPrismaModel {
    const aModel: UserPrismaModel = {
      id: user.getId(),
      username: user.getUsername(),
      password: user.getPassword(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      regionId: user.getRegionId() ?? null,
    };

    return aModel;
  }
}
