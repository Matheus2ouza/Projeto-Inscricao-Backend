import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { EventExpensesZodValidator } from 'src/domain/validators/event-expenses/event-expenses.zod.validator';

export class EventExpensesValidatorFactory {
  public static create(): Validator<EventExpenses> {
    return EventExpensesZodValidator.create();
  }
}
