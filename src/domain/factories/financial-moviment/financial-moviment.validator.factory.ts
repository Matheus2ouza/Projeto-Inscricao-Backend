import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { Validator } from 'src/domain/shared/validators/validator';
import { FinancialMovementZodValidator } from 'src/domain/validators/financial-moviment/financial-moviment.zod.validator';

export class FinancialMovementValidatorFactory {
  public static create(): Validator<FinancialMovement> {
    return FinancialMovementZodValidator.create();
  }
}
