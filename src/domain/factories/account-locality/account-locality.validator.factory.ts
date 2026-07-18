import { AccountLocality } from 'src/domain/entities/account-locality/account-locality.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { AccountLocalityZodValidator } from 'src/domain/validators/account-locality/account-locality.zod.validator';

export class AccountLocalityValidatorFactory {
  public static create(): Validator<AccountLocality> {
    return AccountLocalityZodValidator.create();
  }
}
