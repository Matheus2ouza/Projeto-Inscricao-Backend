import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class InscriptionZodValidator implements Validator<Inscription> {
  private constructor() {}

  public static create(): InscriptionZodValidator {
    return new InscriptionZodValidator();
  }

  public validate(input: Inscription): void {
    try {
      this.getInscriptionZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating inscription ${input.getId()}: ${messages}`,
          `${messages}`,
          InscriptionZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating inscription ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados da inscrição`,
        InscriptionZodValidator.name,
      );
    }
  }

  private getInscriptionZodSchema() {
    const zodSchema = z.object({
      accountId: z.uuid().optional(),
      eventId: z.uuid(),
      //Dados do guest
      guestEmail: z.email('Informe um email válido').optional(),
      guestName: z
        .string()
        .min(1, 'O nome do convidado é obrigatório')
        .optional(),
      guestLocality: z.string().optional(),
      isGuest: z.boolean().optional(),
      responsible: z
        .string()
        .min(1, 'O responsavel pela inscrição é obrigatório'),
      email: z.email('Informe um email válido').optional(),
      phone: z
        .string()
        .regex(
          /^\(\d{2}\)\s9\d{4}-?\d{4}$/,
          'Informe um telefone válido no formato (DDD) 9XXXX-XXXX',
        ),
      status: z.enum(
        [
          InscriptionStatus.PENDING,
          InscriptionStatus.PAID,
          InscriptionStatus.CANCELLED,
          InscriptionStatus.UNDER_REVIEW,
        ],
        'Informe um status válido',
      ),
    });

    return zodSchema;
  }
}
