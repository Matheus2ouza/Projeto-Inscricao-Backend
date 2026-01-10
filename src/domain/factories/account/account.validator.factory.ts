import { Account } from '../../entities/account.entity';
import { Validator } from '../../shared/validators/validator';
import { AccountZodValidator } from '../../validators/account/account.zod.validator';

export class AccountValidatorFactory {
  public static create(): Validator<Account> {
    return AccountZodValidator.create();
  }
}
