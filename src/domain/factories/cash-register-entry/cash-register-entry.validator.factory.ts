import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { CashRegisterEntryZodValidator } from 'src/domain/validators/cash-register-entry/cash-register-entry.zod.validator';

export class CashRegisterEntryValidatorFactory {
  public static create(): Validator<CashRegisterEntry> {
    return CashRegisterEntryZodValidator.create();
  }
}
