import { Validator } from "../shared/validators/validator";
import { LocalityPasswordZodValidator } from "../validators/locality-password.zod.validator";

export class LocalityPasswordZodValidatorFactory {
  public static create(): Validator<string> {
    return LocalityPasswordZodValidator.create();
  }
}