import { Validator } from "../shared/validators/validator";
import { UserPasswordZodValidator } from "../validators/user-password.zod.validator";

export class UserPasswordZodValidatorFactory {
  public static create(): Validator<string> {
    return UserPasswordZodValidator.create();
  }
}