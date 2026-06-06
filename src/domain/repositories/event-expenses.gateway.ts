import { CategoryExpense } from 'generated/prisma';
import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { EventExpenses } from '../entities/event-expenses.entity';

export abstract class EventExpensesGateway {
  abstract create(eventExpenses: EventExpenses): Promise<EventExpenses>;
  abstract createTx(
    eventExpense: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<EventExpenses>;

  abstract findById(id: string): Promise<EventExpenses | null>;
  abstract findMany(eventId: string): Promise<EventExpenses[]>;
  abstract findManyByEventId(eventId: string): Promise<EventExpenses[]>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<EventExpenses[]>;

  abstract summarizeByCategory(cashRegisterId: string): Promise<
    {
      category: CategoryExpense;
      count: number;
      totalValue: number;
    }[]
  >;

  abstract countAll(eventId: string): Promise<number>;
  abstract countTotalExpense(eventId: string): Promise<number>;
}
