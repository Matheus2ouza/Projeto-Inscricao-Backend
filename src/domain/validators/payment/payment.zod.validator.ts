import { StatusPayment } from 'generated/prisma';
import { Payment } from 'src/domain/entities/payment.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class PaymentZodValidator implements Validator<Payment> {
  private constructor() {}

  public static create(): PaymentZodValidator {
    return new PaymentZodValidator();
  }

  public validate(input: Payment): void {
    try {
      this.getPaymentZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating payment ${input.getId()}: ${messages}`,
          `${messages}`,
          PaymentZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating payment ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do pagamento`,
        PaymentZodValidator.name,
      );
    }
  }

  private getPaymentZodSchema() {
    const zodSchema = z.object({
      id: z.uuid(),
      eventId: z.uuid(),
      accountId: z.uuid(),
      status: z.enum(
        [
          StatusPayment.APPROVED,
          StatusPayment.REFUSED,
          StatusPayment.UNDER_REVIEW,
        ],
        {
          message: 'Status inválido',
        },
      ),
      totalValue: z
        .number()
        .positive({ message: 'O valor total deve ser maior que zero' }),
      imageUrl: z.string({ message: 'imagem é inválida' }).optional(),
      createdAt: z.date({ message: 'createdAt é inválido' }),
      updatedAt: z.date({ message: 'updatedAt é inválido' }),
    });

    return zodSchema;
  }
}
