import { Injectable } from '@nestjs/common';
import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { EventResponsibleEntityToEventResponsiblePrismaModelMapper as EntityToPrisma } from './model/mappers/event-responsible-entity-to-event-responsible-prisma-model.mapper';
import { EventResponsiblePrismaModelToEventResponsibleEntityMapper as PrismaToEntity } from './model/mappers/event-responsible-prisma-model-to-event-responsible-entity.mapper';

@Injectable()
export class EventResponsiblePrismaRepository
  implements EventResponsibleGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(eventResponsible: EventResponsible): Promise<EventResponsible> {
    const data = EntityToPrisma.map(eventResponsible);

    const created = await this.prisma.eventResponsibles.create({ data });

    return PrismaToEntity.map(created);
  }

  public async createManyTx(
    eventResponsible: EventResponsible[],
    tx: PrismaTransactionClient,
  ): Promise<void> {
    const data = eventResponsible.map(EntityToPrisma.map);
    await tx.eventResponsibles.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findByEventId(eventId: string): Promise<EventResponsible[]> {
    const found = await this.prisma.eventResponsibles.findMany({
      where: { eventId },
      include: {
        account: true,
      },
    });

    return found.map(PrismaToEntity.map);
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

    return found ? PrismaToEntity.map(found) : null;
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
