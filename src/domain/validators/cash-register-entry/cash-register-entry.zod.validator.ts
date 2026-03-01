import { CashEntryType, PaymentMethod } from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class CashRegisterEntryZodValidator
  implements Validator<CashRegisterEntry>
{
  private constructor() {}

  public static create(): CashRegisterEntryZodValidator {
    return new CashRegisterEntryZodValidator();
  }

  public validate(input: CashRegisterEntry): void {
    try {
      this.getCashRegisterEntryZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating cash register entry ${input.getId()}: ${messages}`,
          `${messages}`,
          CashRegisterEntryZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating cash register entry ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar o lançamento do caixa`,
        CashRegisterEntryZodValidator.name,
      );
    }
  }

  private getCashRegisterEntryZodSchema() {
    return z.object({
      cashRegisterId: z.uuid('Id do caixa é obrigatório'),
      type: z.enum(Object.values(CashEntryType) as [string, ...string[]], {
        error: 'Tipo do lançamento é obrigatório',
      }),
      method: z.enum(Object.values(PaymentMethod) as [string, ...string[]], {
        error: 'Método de pagamento é obrigatório',
      }),
      value: z
        .number({
          error: 'Valor é obrigatório',
        })
        .positive('Valor deve ser maior que zero'),
      description: z.string().optional(),
      eventId: z.uuid().optional(),
      paymentInstallmentId: z.uuid().optional(),
      financialMovementId: z.uuid().optional(),
      onSiteRegistrationId: z.uuid().optional(),
      transferId: z.uuid().optional(),
      responsible: z.string().optional(),
      imageUrl: z.string().optional(),
    });
  }
}
