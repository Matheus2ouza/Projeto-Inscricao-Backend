import { Payment } from 'src/domain/entities/payment.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { PaymentZodValidator } from 'src/domain/validators/payment/payment.zod.validator';

export class PaymentValidatorFactory {
  public static create(): Validator<Payment> {
    return PaymentZodValidator.create();
  }
}
