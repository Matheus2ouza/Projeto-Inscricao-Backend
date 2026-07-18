import { Provider } from '@nestjs/common';
import { AccountLocalityGateway } from 'src/domain/repositories/account-locality.gateway';
import { AccountLocalityPrismaRepository } from '../account-locality.prisma.repository';

export const AccountLocalityPrismaRepositoryProvider: Provider = {
  provide: AccountLocalityGateway,
  useClass: AccountLocalityPrismaRepository,
};
