import { Provider } from '@nestjs/common';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventExpensesPrismaRepository } from '../event-expenses.prisma.repository';

export const EventExpensesPrismaRepositoryProvider: Provider = {
  provide: EventExpensesGateway,
  useClass: EventExpensesPrismaRepository,
};
