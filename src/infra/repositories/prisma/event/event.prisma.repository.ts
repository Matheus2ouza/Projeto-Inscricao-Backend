import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { Region } from 'src/domain/entities/region.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from '../prisma.service';
import { RegionPrismaModelToRegionEntityMapper } from '../region/model/mappers/region-prisma-model-to-region-entity.mapper';
import { EventEntityToEventPrismaModelMapper as EntityToPrisma } from './model/mappers/event-entity-to-event-prisma-model.mapper';
import { EventPrismaModelToEventEntityMapper as PrismaToEntity } from './model/mappers/event-prisma-model-to-event-entity.mapper';

@Injectable()
export class EventPrismaRepository implements EventGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(event: Event): Promise<Event> {
    const data = EntityToPrisma.map(event);
    const created = await this.prisma.events.create({ data });
    return PrismaToEntity.map(created);
  }

  async update(event: Event): Promise<Event> {
    const data = EntityToPrisma.map(event);
    const updated = await this.prisma.events.update({
      where: { id: event.getId() },
      data,
    });
    return PrismaToEntity.map(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.events.delete({ where: { id } });
  }

  async updateImage(id: string, imageUrl: string): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: { imageUrl },
    });
    return PrismaToEntity.map(data);
  }

  async updateLogo(id: string, logoUrl: string): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: {
        logoUrl,
      },
    });

    return PrismaToEntity.map(data);
  }

  // Atualizações de status e pagamento
  async updateInscription(id: string, status: statusEvent): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: { status },
    });
    return PrismaToEntity.map(data);
  }

  async updatePayment(id: string, status: boolean): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: {
        paymentEnabled: status,
      },
    });
    return PrismaToEntity.map(data);
  }

  async paymentEnabled(eventId: string): Promise<void> {
    await this.prisma.events.update({
      where: { id: eventId },
      data: { paymentEnabled: true },
    });
  }

  async paymentDisabled(eventId: string): Promise<void> {
    await this.prisma.events.update({
      where: { id: eventId },
      data: { paymentEnabled: false },
    });
  }

  async paymentCheck(eventId: string): Promise<boolean> {
    const event = await this.prisma.events.findUnique({
      where: { id: eventId },
      select: { paymentEnabled: true },
    });

    if (!event) {
      return false;
    }

    return event.paymentEnabled;
  }

  async enableTicket(eventId: string): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id: eventId },
      data: { ticketEnabled: true },
    });
    return PrismaToEntity.map(data);
  }

  async disableTicket(eventId: string): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id: eventId },
      data: { ticketEnabled: false },
    });
    return PrismaToEntity.map(data);
  }

  async ticketCheck(eventId: string): Promise<Event | null> {
    const event = await this.prisma.events.findUnique({
      where: { id: eventId },
    });
    return event ? PrismaToEntity.map(event) : null;
  }

  //Deletes
  async deleteImage(id: string): Promise<void> {
    await this.prisma.events.update({
      where: { id },
      data: { imageUrl: null },
    });
  }

  async deleteLogo(id: string): Promise<void> {
    await this.prisma.events.update({
      where: { id },
      data: { logoUrl: null },
    });
  }

  // Buscas e listagens
  async findById(id: string): Promise<Event | null> {
    const found = await this.prisma.events.findUnique({
      where: { id },
      include: { region: { select: { name: true } } },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByRegion(regionId: string): Promise<Event[]> {
    const found = await this.prisma.events.findMany({ where: { regionId } });
    return found.map(PrismaToEntity.map);
  }

  async findRegionById(regionId: string): Promise<Region | null> {
    const found = await this.prisma.regions.findUnique({
      where: { id: regionId },
    });
    return found ? RegionPrismaModelToRegionEntityMapper.map(found) : null;
  }

  async findByNameAndRegionId(
    name: string,
    regionId: string,
  ): Promise<Event | null> {
    const found = await this.prisma.events.findFirst({
      where: { name, regionId },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findAll(): Promise<Event[]> {
    const found = await this.prisma.events.findMany({
      orderBy: { createdAt: 'desc' },
      include: { region: { select: { name: true } } },
    });
    return found.map(PrismaToEntity.map);
  }

  //Busca os eventos com base nos filtros de status(referente a inscrição)
  async findAllPaginated(
    page: number,
    pageSize: number,
    filter?: {
      regionId?: string;
      status?: statusEvent[];
      paymentEnabled?: boolean;
      ticketEnabled?: boolean;
    },
  ): Promise<Event[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClauseEvent(filter);
    const found = await this.prisma.events.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      where,
    });
    return found.map(PrismaToEntity.map);
  }

  async findAllFiltered(
    page: number,
    pageSize: number,
    filters?: {
      status?: statusEvent[];
    },
  ): Promise<Event[]> {
    const where = this.buildWhereClauseEvent(filters);
    const skip = (page - 1) * pageSize;

    const found = await this.prisma.events.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { region: { select: { name: true } } },
    });

    return found.map(PrismaToEntity.map);
  }

  async findAllCarousel(): Promise<Event[]> {
    const found = await this.prisma.events.findMany({
      where: {
        status: {
          in: ['OPEN', 'CLOSE'],
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findNextUpcomingEvent(regionId: string): Promise<Event | null> {
    const now = new Date();

    const result = await this.prisma.events.findFirst({
      where: {
        regionId,
        status: { in: ['OPEN', 'CLOSE', 'FINALIZED'] },
        OR: [
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            startDate: { gt: now },
          },
        ],
      },
      orderBy: [
        {
          startDate: 'asc',
        },
      ],
    });

    return result ? PrismaToEntity.map(result) : null;
  }

  async findEventDates(regionId: string): Promise<Event[]> {
    const found = await this.prisma.events.findMany({
      where: { regionId },
      orderBy: { startDate: 'asc' },
    });

    return found.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async countEventsActive(regionId: string): Promise<number> {
    const count = await this.prisma.events.count({
      where: { regionId, status: 'OPEN' },
    });
    return count;
  }

  async countAllFiltered(filters?: {
    status?: statusEvent[];
    regionId?: string;
    paymentEnabled?: boolean;
    ticketEnabled?: boolean;
  }): Promise<number> {
    const where = this.buildWhereClauseEvent(filters);
    return this.prisma.events.count({ where });
  }

  async countTypesInscriptions(id: string): Promise<number> {
    const count = await this.prisma.typeInscriptions.count({
      where: { eventId: id },
    });

    return count;
  }

  async incrementQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: { quantityParticipants: { increment: quantity } },
    });
    return PrismaToEntity.map(data);
  }

  async decrementQuantityParticipants(
    id: string,
    quantity: number,
  ): Promise<Event> {
    const data = await this.prisma.events.update({
      where: { id },
      data: {
        quantityParticipants: { decrement: quantity },
      },
    });
    return PrismaToEntity.map(data);
  }

  async incrementAmountCollected(id: string, value: number): Promise<Event> {
    const aModel = await this.prisma.events.update({
      where: { id },
      data: { amountCollected: { increment: value } },
    });

    return PrismaToEntity.map(aModel);
  }

  async decrementAmountCollected(id: string, value: number): Promise<Event> {
    const aModel = await this.prisma.events.update({
      where: { id },
      data: { amountCollected: { decrement: value } },
    });

    return PrismaToEntity.map(aModel);
  }

  // PDF
  async findBasicDataForPdf(eventId: string): Promise<Event | null> {
    const found = await this.prisma.events.findUnique({
      where: { id: eventId },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  private buildWhereClauseEvent(filter?: {
    regionId?: string;
    status?: statusEvent[];
    paymentEnabled?: boolean;
    ticketEnabled?: boolean;
  }) {
    const { regionId, status, paymentEnabled, ticketEnabled } = filter || {};

    return {
      regionId,
      status: status && status.length > 0 ? { in: status } : undefined,
      paymentEnabled: paymentEnabled !== undefined ? paymentEnabled : undefined,
      ticketEnabled: ticketEnabled !== undefined ? ticketEnabled : undefined,
    };
  }
}
