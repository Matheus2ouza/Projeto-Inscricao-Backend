import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class ExclusiveInscriptionLinkValidator
  implements Validator<ExclusiveInscriptionLink>
{
  constructor() {}

  public static create(): ExclusiveInscriptionLinkValidator {
    return new ExclusiveInscriptionLinkValidator();
  }

  public validate(input: ExclusiveInscriptionLink): void {
    try {
      this.getExclusiveInscriptionLinkValidationSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating exclusive inscription link ${input.getId()}: ${messages}`,
          `${messages}`,
          ExclusiveInscriptionLinkValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating exclusive inscription link ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do link de inscrição exclusivo`,
        ExclusiveInscriptionLinkValidator.name,
      );
    }
  }

  private getExclusiveInscriptionLinkValidationSchema() {
    const TEN_MINUTES = 10 * 60 * 1000;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const zodSchema = z.object({
      eventId: z.uuid(),
      name: z
        .string()
        .trim()
        .min(1, 'O nome do link de inscrição é obrigatório')
        .min(2, 'O nome do link de inscrição deve ter no mínimo 2 caracteres')
        .max(
          255,
          'O nome do link de inscrição deve ter no máximo 255 caracteres',
        ),
      createdBy: z.uuid(),
      // expiresAt deve ser no mínimo 10 minutos no futuro e no máximo 30 dias no futuro
      expiresAt: z.coerce
        .date()
        .refine(
          (date) => {
            const minDate = new Date(Date.now() + TEN_MINUTES);

            return date >= minDate;
          },
          {
            message: 'A expiração deve ser de no mínimo 10 minutos',
          },
        )
        .refine(
          (date) => {
            const maxDate = new Date(Date.now() + THIRTY_DAYS);

            return date <= maxDate;
          },
          {
            message: 'A expiração não pode ultrapassar 30 dias',
          },
        ),
    });
    return zodSchema;
  }
}
