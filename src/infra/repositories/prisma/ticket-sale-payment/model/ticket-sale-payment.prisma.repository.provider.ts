import { Provider } from '@nestjs/common';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSalePaymentPrismaRepository } from '../ticket-sale-payment.prisma.repository';

export const TicketSalePaymentPrismaRepositoryProvider: Provider = {
  provide: TicketSalePaymentGateway,
  useClass: TicketSalePaymentPrismaRepository,
};
