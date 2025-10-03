import { UserGateway } from 'src/domain/repositories/user.geteway';
import { UserPrismaRepository } from '../user.prisma.repository';

export const UserPrismaRepositoryProvider = {
  provide: UserGateway,
  useClass: UserPrismaRepository,
};
