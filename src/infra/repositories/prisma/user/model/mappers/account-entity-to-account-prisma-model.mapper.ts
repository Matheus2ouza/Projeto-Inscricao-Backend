import { Account } from 'src/domain/entities/account.entity';
import AccountPrismaModel from '../account.prisma.model';

//Conversão de entity para model do prisma
export class AccountEntityToUserPrismaModelMapper {
  public static map(user: Account): AccountPrismaModel {
    const aModel: AccountPrismaModel = {
      id: user.getId(),
      username: user.getUsername(),
      password: user.getPassword(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      regionId: user.getRegionId() ?? null,
      email: user.getEmail() ?? null,
      imageUrl: user.getImage() ?? null,
    };

    return aModel;
  }
}
