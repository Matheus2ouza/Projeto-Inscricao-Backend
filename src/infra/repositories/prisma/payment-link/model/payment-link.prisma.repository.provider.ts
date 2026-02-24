import { Provider } from '@nestjs/common';
import { PaymentLinkGateway } from 'src/domain/repositories/payment-link.gateway';
import { PaymentLinkPrismaRepository } from '../payment-link.prisma.repository';

export const PaymentLinkPrismaRepositoryProvider: Provider = {
  provide: PaymentLinkGateway,
  useClass: PaymentLinkPrismaRepository,
};
