import z from 'zod';
import { Validator } from '../shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception';
import { DomainException } from '../shared/exceptions/domain.exception';

export class UserPasswordZodValidator implements Validator<string> {
  private constructor() {}

  public static create(): UserPasswordZodValidator {
    return new UserPasswordZodValidator();
  }

  public validate(input: string): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.FormatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating user: ${message}`,
          `A senha não cumpre os requisitos minimos`,
          UserPasswordZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating user password: ${err.message}`,
        `Error inesperado ao validar a senha da localidade`,
        UserPasswordZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.string().min(6);

    return zodSchema;
  }
}
