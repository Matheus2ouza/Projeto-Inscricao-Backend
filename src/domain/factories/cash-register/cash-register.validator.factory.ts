import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { CashRegisterZodValidator } from 'src/domain/validators/cash-register/cash-register.zod.validator';

export class CashRegisterValidatorFactory {
  public static create(): Validator<CashRegister> {
    return CashRegisterZodValidator.create();
  }
}
