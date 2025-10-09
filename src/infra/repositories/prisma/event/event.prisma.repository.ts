import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Event } from 'src/domain/entities/event.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { EventEntityToEventPrismaModelMapper } from './model/mappers/event-entity-to-event-prisma-model.mapper';
import { EventPrismaModelToEventEntityMapper } from './model/mappers/event-prisma-model-to-event-entity.mapper';
import { RegionPrismaModelToRegionEntityMapper } from '../region/model/mappers/region-prisma-model-to-region-entity.mapper';
import { Region } from 'src/domain/entities/region.entity';

@Injectable()
export class EventPrismaRepository implements EventGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: Event): Promise<Event> {
    const data = EventEntityToEventPrismaModelMapper.map(event);
    const created = await this.prisma.events.create({ data });
    return EventPrismaModelToEventEntityMapper.map(created);
  }

  async findById(id: string): Promise<Event | null> {
    const found = await this.prisma.events.findUnique({
      where: { id },
      include: { region: { select: { name: true } } },
    });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async findByRegion(regionId: string): Promise<Event[]> {
    const found = await this.prisma.events.findMany({ where: { regionId } });
    return found.map(EventPrismaModelToEventEntityMapper.map);
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
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async update(event: Event): Promise<Event> {
    const data = EventEntityToEventPrismaModelMapper.map(event);
    const updated = await this.prisma.events.update({
      where: { id: event.getId() },
      data,
    });
    return EventPrismaModelToEventEntityMapper.map(updated);
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

  async delete(id: string): Promise<void> {
    await this.prisma.events.delete({ where: { id } });
  }

  async findAll(): Promise<Event[]> {
    const found = await this.prisma.events.findMany({
      include: { region: { select: { name: true } } },
    });
    return found.map(EventPrismaModelToEventEntityMapper.map);
  }

  async countTypesInscriptions(id: string): Promise<number> {
    const count = await this.prisma.typeInscriptions.count({
      where: { eventId: id },
    });

    return count;
  }
}
