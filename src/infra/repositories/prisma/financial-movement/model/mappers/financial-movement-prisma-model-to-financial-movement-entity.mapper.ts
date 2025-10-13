import { FinancialMovement } from 'src/domain/entities/financial-movement';
import FinancialMovementPrismaModel from '../financial-movement.model';

export class FinancialMovementPrismaModelToFinancialMovementEntityMapper {
  public static map(
    financialMovement: FinancialMovementPrismaModel,
  ): FinancialMovement {
    const anFinancialMovement = FinancialMovement.with({
      id: financialMovement.id,
      eventId: financialMovement.eventId,
      accountId: financialMovement.accountId,
      type: financialMovement.type,
      value: financialMovement.value,
      createdAt: financialMovement.createdAt,
      updatedAt: financialMovement.updatedAt,
    });

    return anFinancialMovement;
  }
}
