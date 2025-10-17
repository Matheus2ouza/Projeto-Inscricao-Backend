import { Provider } from '@nestjs/common';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventTicketPrismaRepository } from '../event-tickets.prisma.repository';

export const EventTicketPrismaRepositoryProvider: Provider = {
  provide: EventTicketsGateway,
  useClass: EventTicketPrismaRepository,
};
