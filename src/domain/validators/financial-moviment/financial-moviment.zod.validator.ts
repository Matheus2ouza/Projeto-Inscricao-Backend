import { TransactionType } from 'generated/prisma';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { DomainException } from 'src/domain/shared/exceptions/domain.exception';
import { ValidatorDomainException } from 'src/domain/shared/exceptions/validator-domain.exception';
import { Validator } from 'src/domain/shared/validators/validator';
import z from 'zod';

export class FinancialMovementZodValidator
  implements Validator<FinancialMovement>
{
  public constructor() {}

  public static create(): FinancialMovementZodValidator {
    return new FinancialMovementZodValidator();
  }

  public validate(input: FinancialMovement): void {
    try {
      this.getFinancialMovementSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message).join(', ');

        throw new ValidatorDomainException(
          `Error while validating financial movement ${input.getId()}: ${messages}`,
          `${messages}`,
          FinancialMovementZodValidator.name,
        );
      }

      const err = error as Error;

      throw new DomainException(
        `Error while validating financial movement ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar os dados do movimento financeiro`,
        FinancialMovementZodValidator.name,
      );
    }
  }

  private getFinancialMovementSchema() {
    const zodSchema = z.object({
      eventId: z.uuid(),
      accountId: z.uuid().optional(),
      guestEmail: z.email({ message: 'Email inválido' }).optional(),
      inscriptionId: z.uuid().optional(),
      type: z.enum(TransactionType),
      value: z.preprocess((val: any) => {
        if (val && typeof val === 'object' && 'toNumber' in val) {
          return val.toNumber();
        }
        return val;
      }, z.coerce.number().min(0)),
    });
    return zodSchema;
  }
}
