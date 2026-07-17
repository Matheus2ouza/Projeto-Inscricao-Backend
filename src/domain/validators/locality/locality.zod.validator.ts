import { UF } from 'generated/prisma';
import { Locality } from 'src/domain/entities/locality/locality.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
import { z } from 'zod';

export class LocalityZodValidator implements Validator<Locality> {
  private constructor() {}

  public static create(): LocalityZodValidator {
    return new LocalityZodValidator();
  }

  public validate(input: Locality): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating locality ${input.getId()}: ${message}`,
          `Dados para criação da localidade inválidos`,
          LocalityZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating locality ${input.getId()}: ${err.message}`,
        `Error inesperado ao validar os dados da localidade`,
        LocalityZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.uuid(),
      name: z
        .string()
        .min(2, {
          error: 'Nome de localidade muito curto, mínimo 2 caracteres',
        })
        .max(50, {
          error: 'Nome do localidade atingiu o limite máximo de 50 caracteres',
        }),
      uf: z.enum(UF, {
        error:
          'UF inválido. Deve ser uma sigla de estado brasileiro válida (ex: SP, RJ, MG)',
      }),
      regionId: z.uuid(),
      createdAt: z.date(),
      updatedAt: z.date(),
    });
    return zodSchema;
  }
}
