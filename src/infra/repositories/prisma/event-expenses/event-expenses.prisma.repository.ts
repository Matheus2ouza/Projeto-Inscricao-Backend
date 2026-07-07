import { Injectable } from '@nestjs/common';
import { CategoryExpense, PaymentMethod } from 'generated/prisma';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
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

  async createTx(
    eventExpense: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<EventExpenses> {
    const data = EntityToPrisma.map(eventExpense);
    const created = await tx.eventExpenses.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  async update(eventExpenses: EventExpenses): Promise<EventExpenses> {
    const data = EntityToPrisma.map(eventExpenses);
    const updated = await this.prisma.eventExpenses.update({
      where: {
        id: eventExpenses.getId(),
      },
      data,
    });
    return PrismaToEntity.map(updated);
  }

  async updateTx(
    eventExpenses: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<EventExpenses> {
    const data = EntityToPrisma.map(eventExpenses);
    const updated = await tx.eventExpenses.update({
      where: {
        id: eventExpenses.getId(),
      },
      data,
    });
    return PrismaToEntity.map(updated);
  }

  async delete(eventExpenses: EventExpenses): Promise<void> {
    await this.prisma.eventExpenses.delete({
      where: {
        id: eventExpenses.getId(),
      },
    });
  }

  async deleteTx(
    eventExpenses: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<void> {
    await tx.eventExpenses.delete({
      where: {
        id: eventExpenses.getId(),
      },
    });
  }

  async findById(id: string): Promise<EventExpenses | null> {
    const found = await this.prisma.eventExpenses.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findMany(eventId: string): Promise<EventExpenses[]> {
    const found = await this.prisma.eventExpenses.findMany({
      where: { eventId },
    });

    return found.map(PrismaToEntity.map);
  }

  async findManyByEventId(eventId: string): Promise<EventExpenses[]> {
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

  async findExpensesForReport(
    eventId: string,
    filters: {
      category?: CategoryExpense[];
      paymentMethod?: PaymentMethod[];
      startCreatedAt?: Date | string;
      endCreatedAt?: Date | string;
    },
  ): Promise<EventExpenses[]> {
    const where = this.buildWhereClauseExpense(filters);
    const found = await this.prisma.eventExpenses.findMany({
      where: {
        eventId,
        ...where,
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async summarizeByCategory(
    cashRegisterId: string,
    eventId?: string,
  ): Promise<
    { category: CategoryExpense; count: number; totalValue: number }[]
  > {
    const found = await this.prisma.eventExpenses.groupBy({
      by: ['category'],
      where: {
        eventId,
        cashRegisterEntries: {
          some: {
            cashRegisterId,
          },
        },
      },
      _count: {
        _all: true,
      },
      _sum: {
        value: true,
      },
    });

    return found.map((item) => ({
      category: item.category,
      count: item._count._all,
      totalValue: item._sum.value?.toNumber() ?? 0,
    }));
  }

  async countAll(eventId: string): Promise<number> {
    return this.prisma.eventExpenses.count({
      where: { eventId },
    });
  }

  async countTotalExpense(eventId: string): Promise<number> {
    const total = await this.prisma.eventExpenses.aggregate({
      where: {
        eventId,
      },
      _sum: {
        value: true,
      },
    });

    return Number(total);
  }

  private buildWhereClauseExpense(filters: {
    category?: CategoryExpense[];
    paymentMethod?: PaymentMethod[];
    startCreatedAt?: Date | string;
    endCreatedAt?: Date | string;
  }) {
    const { category, paymentMethod, startCreatedAt, endCreatedAt } = filters;

    // Converte os arrays para garantir que são arrays
    const categoryArray = category
      ? Array.isArray(category)
        ? category
        : [category]
      : [];

    const paymentMethodArray = paymentMethod
      ? Array.isArray(paymentMethod)
        ? paymentMethod
        : [paymentMethod]
      : [];

    // Processa as datas
    const parsedStartDate = startCreatedAt
      ? new Date(startCreatedAt)
      : undefined;
    const parsedEndDate = endCreatedAt ? new Date(endCreatedAt) : undefined;

    const validStartDate =
      parsedStartDate && !Number.isNaN(parsedStartDate.getTime())
        ? parsedStartDate
        : undefined;
    const validEndDate =
      parsedEndDate && !Number.isNaN(parsedEndDate.getTime())
        ? parsedEndDate
        : undefined;

    // Monta o filtro de data (similar ao createdAt da função original)
    const createdAt =
      validStartDate || validEndDate
        ? {
            ...(validStartDate ? { gte: validStartDate } : {}),
            ...(validEndDate ? { lte: validEndDate } : {}),
          }
        : undefined;

    return {
      category: categoryArray.length > 0 ? { in: categoryArray } : undefined,
      paymentMethod:
        paymentMethodArray.length > 0 ? { in: paymentMethodArray } : undefined,
      createdAt,
    };
  }
}
