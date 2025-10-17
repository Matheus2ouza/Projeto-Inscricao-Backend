import { Provider } from '@nestjs/common';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TicketSalePrismaRepository } from '../ticket-sale.prisma.repository';

export const TicketSalePrismaRepositoryProvider: Provider = {
  provide: TicketSaleGateway,
  useClass: TicketSalePrismaRepository,
};
