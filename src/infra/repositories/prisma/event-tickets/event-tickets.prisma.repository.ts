import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { PrismaService } from '../prisma.service';
import { EventTicketToEntityToEventTicketPrismaModelMapper } from './model/mappers/event-tickets-to-entity-to-event-tickets-prisma-model.mapper';
import { EventTicketToPrismaModelToEnvetTicketEntityMapper } from './model/mappers/event-tickets-to-prisma-model-to-event-tickets-entity.mapper';

export class EventTicketPrismaRepository implements EventTicketsGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventTickets: EventTicket): Promise<EventTicket | null> {
    const data =
      EventTicketToEntityToEventTicketPrismaModelMapper.map(eventTickets);
    const created = await this.prisma.eventTickets.create({
      data,
    });
    return EventTicketToPrismaModelToEnvetTicketEntityMapper.map(created);
  }
}
