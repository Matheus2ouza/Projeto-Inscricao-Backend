import { FinancialMovement } from '../entities/financial-movement';

export abstract class FinancialMovementGateway {
  // CRUD básico
  abstract create(
    financialMovement: FinancialMovement,
  ): Promise<FinancialMovement>;
  abstract delete(id: string): Promise<void>;
  abstract deleteMany(ids: string[]): Promise<void>;

  // Buscas e listagens
  abstract findById(id: string): Promise<FinancialMovement | null>;
}
