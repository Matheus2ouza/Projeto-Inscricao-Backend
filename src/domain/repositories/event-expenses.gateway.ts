import { EventExpenses } from '../entities/event-expenses.entity';

export abstract class EventExpensesGateway {
  abstract create(eventExpenses: EventExpenses): Promise<EventExpenses>;
  abstract findMany(eventId: string): Promise<EventExpenses[]>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<EventExpenses[]>;
  abstract countAll(eventId: string): Promise<number>;
}
