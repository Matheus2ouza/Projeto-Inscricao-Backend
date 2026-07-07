import { EventSlug } from 'src/domain/entities/event-slug.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class EventSlugZodValidator implements Validator<EventSlug> {
  private constructor() {}

  public static create(): EventSlugZodValidator {
    return new EventSlugZodValidator();
  }

  public validate(input: EventSlug): void {
    try {
      this.getEventSlugZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating event slug ${input.getId()}: ${messages}`,
          `${messages}`,
          EventSlugZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating payment ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do pagamento`,
        EventSlugZodValidator.name,
      );
    }
  }

  private getEventSlugZodSchema() {
    const zodSchema = z.object({
      id: z.uuid(),
      slug: z.string({ error: 'O slug da url é obrigatoria' }),
      eventId: z.uuid({ error: 'É obrigatorio o evento' }),
      isCurrent: z.boolean(),
      clickCount: z
        .number({ error: 'A contagem de acessos tem que ser um numero' })
        .nonnegative({
          error: 'A contagem de acessos tem que ser um numero possitivo',
        }),
      createdAt: z.date(),
    });

    return zodSchema;
  }
}
