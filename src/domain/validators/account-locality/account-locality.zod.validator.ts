import { AccountLocality } from 'src/domain/entities/account-locality/account-locality.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
import { z } from 'zod';

export class AccountLocalityZodValidator implements Validator<AccountLocality> {
  private constructor() {}

  public static create(): AccountLocalityZodValidator {
    return new AccountLocalityZodValidator();
  }

  public validate(input: AccountLocality): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating account locality ${input.getId()}: ${message}`,
          `Dados para associação de conta com localidade inválidos`,
          AccountLocalityZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating account locality ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados da associação de conta com localidade`,
        AccountLocalityZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.uuid({ error: 'ID deve ser um UUID válido' }),
      accountId: z.uuid({ error: 'AccountId deve ser um UUID válido' }),
      localityId: z.uuid({ error: 'LocalityId deve ser um UUID válido' }),
      createdAt: z.date({ error: 'CreatedAt deve ser uma data válida' }),
      updatedAt: z
        .date({ error: 'UpdatedAt deve ser uma data válida' })
        .optional(),
    });
    return zodSchema;
  }
}
