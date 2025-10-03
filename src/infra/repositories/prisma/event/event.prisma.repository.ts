import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Event } from 'src/domain/entities/event.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import EventPrismaModel from './model/event.prisma.model';
import { EventEntityToEventPrismaModelMapper } from './model/mappers/event-entity-to-event-prisma-model.mapper';
import { EventPrismaModelToEventEntityMapper } from './model/mappers/event-prisma-model-to-event-entity.mapper';

@Injectable()
export class EventPrismaRepository implements EventGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(event: Event): Promise<Event> {
    const data = EventEntityToEventPrismaModelMapper.map(event);
    const created = await this.prisma.events.create({ data });
    return EventPrismaModelToEventEntityMapper.map(created);
  }

  async findById(id: string): Promise<Event | null> {
    const found = await this.prisma.events.findUnique({ where: { id } });
    return found ? EventPrismaModelToEventEntityMapper.map(found) : null;
  }

  async findByRegion(regionId: string): Promise<Event[]> {
    const found = await this.prisma.events.findMany({ where: { regionId } });
    return found.map(EventPrismaModelToEventEntityMapper.map);
  }
}
