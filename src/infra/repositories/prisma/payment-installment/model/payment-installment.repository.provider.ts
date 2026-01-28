import { Provider } from '@nestjs/common';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentInstallmentPrismaRepository } from '../payment-installment.prisma.repository';

export const PaymentInstallmentPrismaRepositoryProvider: Provider = {
  provide: PaymentInstallmentGateway,
  useClass: PaymentInstallmentPrismaRepository,
};
