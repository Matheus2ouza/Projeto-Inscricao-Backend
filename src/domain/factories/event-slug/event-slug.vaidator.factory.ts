import { EventSlug } from 'src/domain/entities/event-slug.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { EventSlugZodValidator } from 'src/domain/validators/event-slug/event-slug.zod.validator';

export class EventSlugValidatorFactory {
  public static create(): Validator<EventSlug> {
    return EventSlugZodValidator.create();
  }
}
