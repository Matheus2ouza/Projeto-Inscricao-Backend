import { Provider } from '@nestjs/common';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterEventPrismaRepository } from '../cash-register-event.prisma.repository';

export const CashRegisterEventPrismaRepositoryProvider: Provider = {
  provide: CashRegisterEventGateway,
  useClass: CashRegisterEventPrismaRepository,
};
