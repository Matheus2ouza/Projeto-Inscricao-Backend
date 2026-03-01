import { CashRegisterStatus } from 'generated/prisma';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class CashRegisterZodValidator implements Validator<CashRegister> {
  private constructor() {}

  public static create(): CashRegisterZodValidator {
    return new CashRegisterZodValidator();
  }

  public validate(input: CashRegister): void {
    try {
      this.getCashRegisterZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating cash register ${input.getId()}: ${messages}`,
          `${messages}`,
          CashRegisterZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating cash register ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do caixa`,
        CashRegisterZodValidator.name,
      );
    }
  }

  private getCashRegisterZodSchema() {
    return z.object({
      name: z.string().min(2, 'Nome do caixa é obrigatório'),
      regionId: z.uuid('Id da região é obrigatório'),
      status: z.enum(
        Object.values(CashRegisterStatus) as [string, ...string[]],
        {
          error: 'Status do caixa é obrigatório',
        },
      ),
      balance: z.number({
        error: 'Saldo é obrigatório',
      }),
      openedAt: z.date({
        error: 'Data de abertura é obrigatória',
      }),
      closedAt: z.date().optional(),
    });
  }
}
