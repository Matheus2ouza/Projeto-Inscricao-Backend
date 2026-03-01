import { Provider } from '@nestjs/common';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEntryPrismaRepository } from '../cash-register-entry.prisma.repository';

export const CashRegisterEntryPrismaRepositoryProvider: Provider = {
  provide: CashRegisterEntryGateway,
  useClass: CashRegisterEntryPrismaRepository,
};
