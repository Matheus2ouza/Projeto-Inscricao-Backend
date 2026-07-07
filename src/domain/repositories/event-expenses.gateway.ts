import { CategoryExpense, PaymentMethod } from 'generated/prisma';
import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { EventExpenses } from '../entities/event-expenses.entity';

export abstract class EventExpensesGateway {
  abstract create(eventExpenses: EventExpenses): Promise<EventExpenses>;
  abstract createTx(
    eventExpense: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<EventExpenses>;

  abstract update(eventExpenses: EventExpenses): Promise<EventExpenses>;
  abstract updateTx(
    eventExpenses: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<EventExpenses>;

  abstract delete(eventExpenses: EventExpenses): Promise<void>;
  abstract deleteTx(
    eventExpenses: EventExpenses,
    tx: PrismaTransactionClient,
  ): Promise<void>;

  abstract findById(id: string): Promise<EventExpenses | null>;
  abstract findMany(eventId: string): Promise<EventExpenses[]>;
  abstract findManyByEventId(eventId: string): Promise<EventExpenses[]>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<EventExpenses[]>;

  abstract findExpensesForReport(
    eventId: string,
    filters: {
      category?: CategoryExpense[];
      paymentMethod?: PaymentMethod[];
      startCreatedAt?: Date | string;
      endCreatedAt?: Date | string;
    },
  ): Promise<EventExpenses[]>;

  abstract summarizeByCategory(
    cashRegisterId?: string,
    eventId?: string,
  ): Promise<
    {
      category: CategoryExpense;
      count: number;
      totalValue: number;
    }[]
  >;

  abstract countAll(eventId: string): Promise<number>;
  abstract countTotalExpense(eventId: string): Promise<number>;
}
