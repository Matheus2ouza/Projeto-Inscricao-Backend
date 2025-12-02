import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { AccountPrismaRepository } from '../account.prisma.repository';

export const AccountPrismaRepositoryProvider = {
  provide: AccountGateway,
  useClass: AccountPrismaRepository,
};
