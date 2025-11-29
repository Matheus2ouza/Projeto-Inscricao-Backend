import { Injectable } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { PrismaService } from '../prisma.service';
import { EventTicketToEntityToEventTicketPrismaModelMapper } from './model/mappers/event-tickets-to-entity-to-event-tickets-prisma-model.mapper';
import { EventTicketToPrismaModelToEnvetTicketEntityMapper } from './model/mappers/event-tickets-to-prisma-model-to-event-tickets-entity.mapper';

@Injectable()
export class EventTicketPrismaRepository implements EventTicketsGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(EventTicket: EventTicket): Promise<EventTicket> {
    const data =
      EventTicketToEntityToEventTicketPrismaModelMapper.map(EventTicket);

    const created = await this.prisma.eventTickets.create({ data });
    return EventTicketToPrismaModelToEnvetTicketEntityMapper.map(created);
  }

  // Atualizações
  async decrementAvailable(id: string, quantity: number): Promise<EventTicket> {
    const data = await this.prisma.eventTickets.update({
      where: { id },
      data: {
        available: {
          decrement: quantity,
        },
      },
    });

    return EventTicketToPrismaModelToEnvetTicketEntityMapper.map(data);
  }

  async incrementAvailable(id: string, quantity: number): Promise<EventTicket> {
    const data = await this.prisma.eventTickets.update({
      where: { id },
      data: {
        available: {
          increment: quantity,
        },
      },
    });

    return EventTicketToPrismaModelToEnvetTicketEntityMapper.map(data);
  }

  // Buscas e listagens
  async findById(id: string): Promise<EventTicket | null> {
    const data = await this.prisma.eventTickets.findUnique({
      where: { id },
    });

    return data
      ? EventTicketToPrismaModelToEnvetTicketEntityMapper.map(data)
      : null;
  }

  async findByIds(ids: string[]): Promise<EventTicket[]> {
    const data = await this.prisma.eventTickets.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return data.map(EventTicketToPrismaModelToEnvetTicketEntityMapper.map);
  }

  async findAll(eventId: string): Promise<EventTicket[]> {
    const aModal = await this.prisma.eventTickets.findMany({
      where: { eventId },
    });

    return aModal.map(EventTicketToPrismaModelToEnvetTicketEntityMapper.map);
  }
}
