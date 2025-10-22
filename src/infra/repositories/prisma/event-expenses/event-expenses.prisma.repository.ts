import { Injectable } from '@nestjs/common';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { PrismaService } from '../prisma.service';
import { EventExpensesEntityToEventExpensesPrismaModelMapper as EntityToPrisma } from './model/mappers/event-expenses-entity-to-event-expenses-prisma-model.mapper';
import { EventExpensesPrismaModelToEventExpensesEntityMapper as PrismaToEntity } from './model/mappers/event-expenses-prisma-model-to-event-expenses-entity.mapper';

@Injectable()
export class EventExpensesPrismaRepository implements EventExpensesGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(eventExpenses: EventExpenses): Promise<EventExpenses> {
    const data = EntityToPrisma.map(eventExpenses);
    const created = await this.prisma.eventExpenses.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  async findMany(eventId: string): Promise<EventExpenses[]> {
    const found = await this.prisma.eventExpenses.findMany({
      where: { eventId },
    });

    return found.map(PrismaToEntity.map);
  }

  async findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<EventExpenses[]> {
    const skip = (page - 1) * pageSize;

    const rows = await this.prisma.eventExpenses.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return rows.map(PrismaToEntity.map);
  }

  async countAll(eventId: string): Promise<number> {
    return this.prisma.eventExpenses.count({
      where: { eventId },
    });
  }
}
