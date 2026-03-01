import { CashRegisterTransfer } from 'src/domain/entities/cash-register-transfer.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { CashRegisterTransferZodValidator } from 'src/domain/validators/cash-register-transfer/cash-register-transfer.zod.validator';

export class CashRegisterTransferValidatorFactory {
  public static create(): Validator<CashRegisterTransfer> {
    return CashRegisterTransferZodValidator.create();
  }
}
