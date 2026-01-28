import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class PaymentInstallmentZodValidator
  implements Validator<PaymentInstallment>
{
  private constructor() {}

  public static create(): PaymentInstallmentZodValidator {
    return new PaymentInstallmentZodValidator();
  }

  public validate(input: PaymentInstallment): void {
    try {
      this.generateSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating payment installment ${input.getId()}: ${messages}`,
          `${messages}`,
          PaymentInstallmentZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating payment installment ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do pagamento`,
        PaymentInstallmentZodValidator.name,
      );
    }
  }

  private generateSchema() {
    const zodSchema = z.object({
      paymentId: z.uuid(),
      installmentNumber: z.number().int().positive(),
      value: z.number().positive(),
      netValue: z.number().positive(),
      asaasPaymentId: z.string(),
      paidAt: z.date(),
    });
    return zodSchema;
  }
}
