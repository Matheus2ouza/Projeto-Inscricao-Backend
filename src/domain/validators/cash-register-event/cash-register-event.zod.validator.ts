import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class CashRegisterEventZodValidator
  implements Validator<CashRegisterEvent>
{
  private constructor() {}

  public static create(): CashRegisterEventZodValidator {
    return new CashRegisterEventZodValidator();
  }

  public validate(input: CashRegisterEvent): void {
    try {
      this.getCashRegisterEventZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating cash register event ${input.getId()}: ${messages}`,
          `${messages}`,
          CashRegisterEventZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating cash register event ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar a vinculação de caixa ao evento`,
        CashRegisterEventZodValidator.name,
      );
    }
  }

  private getCashRegisterEventZodSchema() {
    return z.object({
      cashRegisterId: z.uuid('Id do caixa é obrigatório'),
      eventId: z.uuid('Id do evento é obrigatório'),
    });
  }
}
