import { Provider } from '@nestjs/common';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PaymentPrismaRepository } from '../payment.prisma.repository';

export const PaymentPrismaRepositoryProvider: Provider = {
  provide: PaymentGateway,
  useClass: PaymentPrismaRepository,
};
