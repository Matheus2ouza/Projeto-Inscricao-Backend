import { Validator } from '../../shared/validators/validator';
import { AccountPasswordZodValidator } from '../../validators/account/account-password.zod.validator';

export class AccountPasswordZodValidatorFactory {
  public static create(): Validator<string> {
    return AccountPasswordZodValidator.create();
  }
}
