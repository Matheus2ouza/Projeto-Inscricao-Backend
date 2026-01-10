import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class PaymentAllocationZodValidator
  implements Validator<PaymentAllocation>
{
  private constructor() {}

  public static create(): PaymentAllocationZodValidator {
    return new PaymentAllocationZodValidator();
  }

  public validate(input: PaymentAllocation): void {
    try {
      this.getPaymentAllocationSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating payment allocation ${input.getId()}: ${messages}`,
          `${messages}`,
          PaymentAllocationZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating payment allocation ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados da alocação de pagamento`,
        PaymentAllocationZodValidator.name,
      );
    }
  }

  private getPaymentAllocationSchema() {
    const paymentAllocationSchema = z.object({
      id: z.uuid({ message: 'id é inválido' }),
      paymentId: z.uuid({ message: 'paymentId é inválido' }),
      inscriptionId: z.uuid({ message: 'inscriptionId é inválido' }),
      value: z
        .number()
        .positive({ message: 'o valor deve ser maior que zero' }),
      createdAt: z.date({ message: 'createdAt é inválido' }),
    });

    return paymentAllocationSchema;
  }
}
