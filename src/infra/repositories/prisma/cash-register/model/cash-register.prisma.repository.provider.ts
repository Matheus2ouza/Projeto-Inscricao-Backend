import { Provider } from '@nestjs/common';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { CashRegisterPrismaRepository } from '../cash-register.prisma.repository';

export const CashRegisterPrismaRepositoryProvider: Provider = {
  provide: CashRegisterGateway,
  useClass: CashRegisterPrismaRepository,
};
