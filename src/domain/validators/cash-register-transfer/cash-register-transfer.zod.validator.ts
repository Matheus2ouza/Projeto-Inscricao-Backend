import { CashRegisterTransfer } from 'src/domain/entities/cash-register-transfer.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class CashRegisterTransferZodValidator
  implements Validator<CashRegisterTransfer>
{
  private constructor() {}

  public static create(): CashRegisterTransferZodValidator {
    return new CashRegisterTransferZodValidator();
  }

  public validate(input: CashRegisterTransfer): void {
    try {
      this.getCashRegisterTransferZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating cash register transfer ${input.getId()}: ${messages}`,
          `${messages}`,
          CashRegisterTransferZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating cash register transfer ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar a transferência entre caixas`,
        CashRegisterTransferZodValidator.name,
      );
    }
  }

  private getCashRegisterTransferZodSchema() {
    return z.object({
      fromCashId: z.uuid('Id do caixa de origem é obrigatório'),
      toCashId: z.uuid('Id do caixa de destino é obrigatório'),
      value: z
        .number({
          error: 'Valor é obrigatório',
        })
        .positive('Valor deve ser maior que zero'),
      description: z.string().optional(),
      responsible: z.string().optional(),
      imageUrl: z.string().optional(),
    });
  }
}
