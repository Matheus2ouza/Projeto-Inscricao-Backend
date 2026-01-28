import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { PaymentInstallmentZodValidator } from 'src/domain/validators/payment-installment/payment-installment.zod.validator';

export class PaymentInstallmentValidatorFactory {
  public static create(): Validator<PaymentInstallment> {
    return PaymentInstallmentZodValidator.create();
  }
}
