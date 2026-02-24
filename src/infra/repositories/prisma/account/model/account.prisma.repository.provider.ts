import { Provider } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { AccountPrismaRepository } from '../account.prisma.repository';

export const AccountPrismaRepositoryProvider: Provider = {
  provide: AccountGateway,
  useClass: AccountPrismaRepository,
};
