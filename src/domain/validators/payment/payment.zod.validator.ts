import { StatusPayment } from 'generated/prisma';
import { Payment } from 'src/domain/entities/payment.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import { ZodUtils } from 'src/shared/utils/zod-utils';
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
        const userMessage = ZodUtils.formatZodError(error);
        const logMessage = ZodUtils.formatZodErrorForLog(error, input);
        throw new ValidatorDomainException(
          `Error while validating payment ${input.getId()}: ${logMessage}`,
          `${userMessage}`,
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
      accountId: z.uuid().optional(),
      guestName: z
        .string()
        .min(3, 'O nome do convidado deve ter no mínimo 3 caracteres')
        .optional(),
      guestEmail: z.email({ message: 'Email inválido' }).optional(),
      accessToken: z.string().optional(),
      isGuest: z.boolean().optional(),
      status: z.enum(
        [
          StatusPayment.APPROVED,
          StatusPayment.PENDING,
          StatusPayment.UNDER_REVIEW,
          StatusPayment.REFUSED,
        ],
        {
          message: 'Status inválido',
        },
      ),
      totalValue: z
        .number({ error: 'O valor pago tem que ser um numero valido' })
        .positive({ message: 'O valor total deve ser maior que zero' }),
      imageUrls: z
        .array(
          z
            .string()
            .refine((i) => i.startsWith('payment') && i.endsWith('webp'), {
              error: 'Formato do comprovante invalido',
            }),
        )
        .max(3, { error: 'Limite máximo de comprovantes atingido' }),
      createdAt: z.date({ message: 'createdAt é inválido' }),
      updatedAt: z.date({ message: 'updatedAt é inválido' }),
    });

    return zodSchema;
  }
}
