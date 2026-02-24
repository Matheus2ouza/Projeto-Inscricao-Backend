import { PaymentLink } from 'src/domain/entities/payment-link.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { PaymentLinkZodValidator } from 'src/domain/validators/payment-link/payment-link.zod.validator';

export class PaymentLinkValidatorFactory {
  public static create(): Validator<PaymentLink> {
    return PaymentLinkZodValidator.create();
  }
}
