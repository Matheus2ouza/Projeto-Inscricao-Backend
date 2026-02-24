import { PaymentLink } from 'src/domain/entities/payment-link.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class PaymentLinkZodValidator implements Validator<PaymentLink> {
  private constructor() {}

  public static create(): PaymentLinkZodValidator {
    return new PaymentLinkZodValidator();
  }

  public validate(input: PaymentLink): void {
    try {
      this.getPaymentLinkZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating payment link ${input.getId()}: ${messages}`,
          `${messages}`,
          PaymentLinkZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating payment link ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do link de pagamento`,
        PaymentLinkZodValidator.name,
      );
    }
  }

  private getPaymentLinkZodSchema() {
    const zodSchema = z.object({
      name: z.string().min(1, 'Campo obrigatório'),
      description: z.string().min(1, 'Campo obrigatório'),
      value: z.number().positive('Campo obrigatório'),
      asaasPaymentLinkId: z.string().min(1, 'Campo obrigatório'),
      url: z.url('URL inválida').min(1, 'Campo tem que ser uma url valida'),
      active: z.boolean(),
    });

    return zodSchema;
  }
}
