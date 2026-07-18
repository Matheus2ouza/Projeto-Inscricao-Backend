import { Account } from 'src/domain/entities/account/account.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { AccountZodValidator } from 'src/domain/validators/account/account.zod.validator';

export class AccountValidatorFactory {
  public static create(): Validator<Account> {
    return AccountZodValidator.create();
  }
}
