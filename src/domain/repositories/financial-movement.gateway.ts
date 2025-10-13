import { FinancialMovement } from '../entities/financial-movement';

export abstract class FinancialMovementGateway {
  abstract create(
    financialMovement: FinancialMovement,
  ): Promise<FinancialMovement>;
}
