import { Injectable } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { PrismaService } from '../prisma.service';
import { EventTicketToEntityToEventTicketPrismaModelMapper } from './model/mappers/event-tickets-to-entity-to-event-tickets-prisma-model.mapper';
import { EventTicketToPrismaModelToEnvetTicketEntityMapper } from './model/mappers/event-tickets-to-prisma-model-to-event-tickets-entity.mapper';

@Injectable()
export class EventTicketPrismaRepository implements EventTicketsGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(EventTicket: EventTicket): Promise<EventTicket> {
    const data =
      EventTicketToEntityToEventTicketPrismaModelMapper.map(EventTicket);

    const created = await this.prisma.eventTickets.create({ data });
    return EventTicketToPrismaModelToEnvetTicketEntityMapper.map(created);
  }

  async findById(id: string): Promise<EventTicket | null> {
    console.log('dentro da busca', id);
    const data = await this.prisma.eventTickets.findUnique({
      where: { id },
    });

    return data
      ? EventTicketToPrismaModelToEnvetTicketEntityMapper.map(data)
      : null;
  }

  async findAll(eventId: string): Promise<EventTicket[]> {
    const aModal = await this.prisma.eventTickets.findMany({
      where: { eventId },
    });

    return aModal.map(EventTicketToPrismaModelToEnvetTicketEntityMapper.map);
  }

  async UpdateAvailable(id: string, available: number): Promise<EventTicket> {
    const data = await this.prisma.eventTickets.update({
      where: { id },
      data: {
        available: {
          decrement: available,
        },
      },
    });

    return EventTicketToPrismaModelToEnvetTicketEntityMapper.map(data);
  }
}
