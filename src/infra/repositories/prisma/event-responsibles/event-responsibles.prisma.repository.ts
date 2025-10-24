import { Injectable } from '@nestjs/common';
import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { PrismaService } from '../prisma.service';
import { EventResponsibleEntityToEventResponsiblePrismaModelMapper } from './model/mappers/event-responsible-entity-to-event-responsible-prisma-model.mapper';
import { EventResponsiblePrismaModelToEventResponsibleEntityMapper } from './model/mappers/event-responsible-prisma-model-to-event-responsible-entity.mapper';

@Injectable()
export class EventResponsiblePrismaRepository
  implements EventResponsibleGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    eventResponsible: EventResponsible,
  ): Promise<EventResponsible> {
    const data =
      EventResponsibleEntityToEventResponsiblePrismaModelMapper.map(
        eventResponsible,
      );

    const created = await this.prisma.eventResponsibles.create({ data });

    return EventResponsiblePrismaModelToEventResponsibleEntityMapper.map(
      created,
    );
  }

  async findByEventId(eventId: string): Promise<EventResponsible[]> {
    const found = await this.prisma.eventResponsibles.findMany({
      where: { eventId },
    });

    return found.map(
      EventResponsiblePrismaModelToEventResponsibleEntityMapper.map,
    );
  }

  async findByEventAndAccount(
    eventId: string,
    accountId: string,
  ): Promise<EventResponsible | null> {
    const found = await this.prisma.eventResponsibles.findUnique({
      where: {
        eventId_accountId: { eventId, accountId },
      },
    });

    return found
      ? EventResponsiblePrismaModelToEventResponsibleEntityMapper.map(found)
      : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.eventResponsibles.delete({ where: { id } });
  }

  async deleteByEventAndAccount(
    eventId: string,
    accountId: string,
  ): Promise<void> {
    await this.prisma.eventResponsibles.delete({
      where: {
        eventId_accountId: { eventId, accountId },
      },
    });
  }
}
