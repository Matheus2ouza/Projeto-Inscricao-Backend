import { Provider } from '@nestjs/common';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSaleItemPrismaRepository } from '../ticket-sale-item.prisma.repository';

export const TicketSaleItemPrismaRepositoryProvider: Provider = {
  provide: TicketSaleItemGateway,
  useClass: TicketSaleItemPrismaRepository,
};

