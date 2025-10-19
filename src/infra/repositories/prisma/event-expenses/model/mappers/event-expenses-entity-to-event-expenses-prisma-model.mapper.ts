import Decimal from 'decimal.js';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import EventExpensesPrismaModel from '../event-expenses.prisma.model';

export class EventExpensesEntityToEventExpensesPrismaModelMapper {
  public static map(
    eventExpenses: EventExpenses,
  ): EventExpensesPrismaModel {
    return {
      id: eventExpenses.getId(),
      eventId: eventExpenses.getEventId(),
      description: eventExpenses.getDescription(),
      value: new Decimal(eventExpenses.getValue()),
      paymentMethod: eventExpenses.getPaymentMethod(),
      responsible: eventExpenses.getResponsible(),
      createdAt: eventExpenses.getCreatedAt(),
      updatedAt: eventExpenses.getUpdatedAt(),
    };
  }
}
