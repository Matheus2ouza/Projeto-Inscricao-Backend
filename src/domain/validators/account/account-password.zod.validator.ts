import { ZodUtils } from 'src/shared/utils/zod-utils';
import z from 'zod';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { ValidatorDomainException } from '../../shared/exceptions/validator-domain.exception';
import { Validator } from '../../shared/validators/validator';

export class AccountPasswordZodValidator implements Validator<string> {
  private constructor() {}

  public static create(): AccountPasswordZodValidator {
    return new AccountPasswordZodValidator();
  }

  public validate(input: string): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.FormatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating account password: ${message}`,
          `A senha não cumpre os requisitos minimos`,
          AccountPasswordZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating account password: ${err.message}`,
        `Error inesperado ao validar a senha da conta`,
        AccountPasswordZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.string().min(6);

    return zodSchema;
  }
}
