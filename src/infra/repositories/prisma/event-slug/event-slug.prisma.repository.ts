import { Injectable } from '@nestjs/common';
import { EventSlug } from 'src/domain/entities/event-slug.entity';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventSlugEntityToEventSlugPrimaModelMapper as EntityToPrisma } from 'src/infra/repositories/prisma/event-slug/model/mappers/event-slug-entity-to-event-slug-prisma-model.mapper';
import { PrismaService } from '../prisma.service';
import { EventSlugPrismaModelToEventSlugEntity as PrismaToEntity } from './model/mappers/event-slug-prisma-model-to-event-slug-entity.mapper';

@Injectable()
export class EventSlugPrismaRepository implements EventSlugGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async create(eventSlug: EventSlug): Promise<EventSlug> {
    const data = EntityToPrisma.map(eventSlug);
    const created = await this.prisma.eventSlug.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  public async findById(id: string): Promise<EventSlug | null> {
    const found = await this.prisma.eventSlug.findUnique({
      where: {
        id,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  public async findBySlug(slug: string): Promise<EventSlug | null> {
    const found = await this.prisma.eventSlug.findUnique({
      where: {
        slug,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  public async findByEventId(eventId: string): Promise<EventSlug | null> {
    const found = await this.prisma.eventSlug.findFirst({
      where: {
        eventId,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  public async findCurrent(eventId: string): Promise<EventSlug | null> {
    const found = await this.prisma.eventSlug.findFirst({
      where: {
        eventId,
        isCurrent: true,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }
}
