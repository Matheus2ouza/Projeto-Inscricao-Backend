import { ZodUtils } from 'src/shared/utils/zod-utils';
import { z } from 'zod';
import { Account } from '../../entities/account.entity';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { ValidatorDomainException } from '../../shared/exceptions/validator-domain.exception';
import { Validator } from '../../shared/validators/validator';

export class AccountZodValidator implements Validator<Account> {
  private constructor() {}

  public static create(): AccountZodValidator {
    return new AccountZodValidator();
  }

  public validate(input: Account): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.FormatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating user ${input.getId()}: ${message}`,
          `Dados para criação da conta invalidos`,
          AccountZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating user ${input.getId()}: ${err.message}`,
        `Error inesperado ao validar os dados da conta`,
        AccountZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.uuid(),
      username: z.string().min(2),
      password: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
    });
    return zodSchema;
  }
}
