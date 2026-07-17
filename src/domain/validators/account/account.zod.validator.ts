import { roleType } from 'generated/prisma';
import { Account } from 'src/domain/entities/account/account.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
import { z } from 'zod';

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
        const message = ZodUtils.formatZodError(error);
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
      username: z
        .string()
        .min(2, { error: 'Nome de usuário muito curto, mínimo 2 caracteres' })
        .max(50, {
          error: 'Nome do usuário atingiu o limite máximo de 50 caracteres',
        }),
      password: z.string(),
      role: z.enum(roleType, { error: 'Role do usuário invalido' }),
      active: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
      email: z.email({ error: 'Email invalido' }).optional(),
    });
    return zodSchema;
  }
}
