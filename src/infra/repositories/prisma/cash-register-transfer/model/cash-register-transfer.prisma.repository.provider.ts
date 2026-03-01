import { Provider } from '@nestjs/common';
import { CashRegisterTransferGateway } from 'src/domain/repositories/cash-register-transfer.gateway';
import { CashRegisterTransferPrismaRepository } from '../cash-register-transfer.prisma.repository';

export const CashRegisterTransferPrismaRepositoryProvider: Provider = {
  provide: CashRegisterTransferGateway,
  useClass: CashRegisterTransferPrismaRepository,
};
