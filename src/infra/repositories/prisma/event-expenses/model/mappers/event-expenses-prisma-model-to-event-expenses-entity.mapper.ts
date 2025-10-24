import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import EventExpensesPrismaModel from '../event-expenses.prisma.model';

export class EventExpensesPrismaModelToEventExpensesEntityMapper {
  public static map(eventExpenses: EventExpensesPrismaModel): EventExpenses {
    return EventExpenses.with({
      id: eventExpenses.id,
      eventId: eventExpenses.eventId,
      description: eventExpenses.description,
      value: Number(eventExpenses.value),
      paymentMethod: eventExpenses.paymentMethod,
      responsible: eventExpenses.responsible,
      createdAt: eventExpenses.createdAt,
      updatedAt: eventExpenses.updatedAt,
    });
  }
}
