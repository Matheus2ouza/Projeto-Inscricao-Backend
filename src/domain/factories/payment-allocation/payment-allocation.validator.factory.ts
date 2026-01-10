import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Validator } from 'src/domain/shared/validators/validator';
import { PaymentAllocationZodValidator } from 'src/domain/validators/payment-allocation/payment-allocation.zod.validator';

export class PaymentAllocationValidatorFactory {
  public static create(): Validator<PaymentAllocation> {
    return PaymentAllocationZodValidator.create();
  }
}
