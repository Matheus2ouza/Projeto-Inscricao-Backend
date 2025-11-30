import { Account } from '../entities/account.entity';
import { Validator } from '../shared/validators/validator';
import { UserZodValidator } from '../validators/user.zod.validator';

export class UserValidatorFactory {
  public static create(): Validator<Account> {
    return UserZodValidator.create();
  }
}
