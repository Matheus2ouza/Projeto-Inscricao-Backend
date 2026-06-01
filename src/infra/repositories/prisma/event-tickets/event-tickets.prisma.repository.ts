import { Injectable } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { EventTicketToEntityToEventTicketPrismaModelMapper as EntityToPrisma } from './model/mappers/event-tickets-to-entity-to-event-tickets-prisma-model.mapper';
import { EventTicketToPrismaModelToEnvetTicketEntityMapper as PrismaToEntity } from './model/mappers/event-tickets-to-prisma-model-to-event-tickets-entity.mapper';

@Injectable()
export class EventTicketPrismaRepository implements EventTicketsGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(eventTicket: EventTicket): Promise<EventTicket> {
    const data = EntityToPrisma.map(eventTicket);

    const created = await this.prisma.eventTickets.create({ data });
    return PrismaToEntity.map(created);
  }

  async upsert(eventTicket: EventTicket): Promise<EventTicket> {
    const data = EntityToPrisma.map(eventTicket);
    const created = await this.prisma.eventTickets.upsert({
      where: {
        id: eventTicket.getId(),
      },
      update: data,
      create: data,
    });
    return PrismaToEntity.map(created);
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

    return PrismaToEntity.map(data);
  }

  async decrementAvailableTx(
    id: string,
    quantity: number,
    tx: PrismaTransactionClient,
  ): Promise<EventTicket> {
    const data = await tx.eventTickets.update({
      where: { id },
      data: {
        available: {
          decrement: quantity,
        },
      },
    });

    return PrismaToEntity.map(data);
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

    return PrismaToEntity.map(data);
  }

  // Buscas e listagens
  async findById(id: string): Promise<EventTicket | null> {
    const data = await this.prisma.eventTickets.findUnique({
      where: { id },
    });

    return data ? PrismaToEntity.map(data) : null;
  }

  async findByIds(ids: string[]): Promise<EventTicket[]> {
    const data = await this.prisma.eventTickets.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return data.map(PrismaToEntity.map);
  }

  async findAll(eventId: string): Promise<EventTicket[]> {
    const aModal = await this.prisma.eventTickets.findMany({
      where: { eventId },
    });

    return aModal.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async countByEventId(eventId: string): Promise<number> {
    const total = await this.prisma.eventTickets.count({
      where: { eventId },
    });

    return total;
  }
}
