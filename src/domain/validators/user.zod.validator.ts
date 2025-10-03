import { z } from 'zod';
import { User } from '../entities/user.entity';
import { Validator } from '../shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception';
import { DomainException } from '../shared/exceptions/domain.exception';

export class UserZodValidator implements Validator<User> {
  private constructor() {}

  public static create(): UserZodValidator {
    return new UserZodValidator();
  }

  public validate(input: User): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.FormatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating user ${input.getId()}: ${message}`,
          `Dados para criação da localidade invalidos`,
          UserZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating user ${input.getId()}: ${err.message}`,
        `Error inesperado ao validar os dados da localidade`,
        UserZodValidator.name,
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
