import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { CashRegisterEventZodValidator } from 'src/domain/validators/cash-register-event/cash-register-event.zod.validator';

export class CashRegisterEventValidatorFactory {
  public static create(): Validator<CashRegisterEvent> {
    return CashRegisterEventZodValidator.create();
  }
}
