import { Provider } from '@nestjs/common';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentAllocationPrismaRepository } from '../payment-allocation.prisma.repository';

export const PaymentAllocationPrismaRepositoryProvider: Provider = {
  provide: PaymentAllocationGateway,
  useClass: PaymentAllocationPrismaRepository,
};
