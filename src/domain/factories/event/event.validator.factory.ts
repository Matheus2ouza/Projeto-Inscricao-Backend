import { Event } from 'src/domain/entities/event/event.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { EventZodValidator } from 'src/domain/validators/event/event.zod.validator';

export class EventValidatorFactory {
  public static create(): Validator<Event> {
    return EventZodValidator.create();
  }
}
