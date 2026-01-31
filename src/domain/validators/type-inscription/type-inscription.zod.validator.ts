import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class TypeInscriptionZodValidator implements Validator<TypeInscription> {
  constructor() {}

  public static create(): TypeInscriptionZodValidator {
    return new TypeInscriptionZodValidator();
  }

  public validate(input: TypeInscription): void {
    try {
      this.getTypeInscriptionSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating type inscription ${input.getId()}: ${messages}`,
          `${messages}`,
          TypeInscriptionZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating type inscription ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do tipo de inscrição`,
        TypeInscriptionZodValidator.name,
      );
    }
  }

  private getTypeInscriptionSchema() {
    const typeInscriptionSchema = z.object({
      description: z.string({ message: 'A descrição é obrigatória' }).min(1),
      value: z.number({ message: 'O valor é obrigatório' }).min(0),
      eventId: z.string().min(1),
      specialtype: z.boolean(),
      rule: z
        .date({ message: 'A regra tem que ser uma data válida' })
        .optional(),
    });

    return typeInscriptionSchema;
  }
}
