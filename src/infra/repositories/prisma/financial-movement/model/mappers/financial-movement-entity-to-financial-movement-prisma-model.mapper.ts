import { FinancialMovement } from 'src/domain/entities/financial-movement';
import FinancialMovementPrismaModel from '../financial-movement.model';

export class FinancialMovementEntityToFinancialMovementPrismaModelMapper {
  public static map(
    financialMovement: FinancialMovement,
  ): FinancialMovementPrismaModel {
    const aModel: FinancialMovementPrismaModel = {
      id: financialMovement.getId(),
      eventId: financialMovement.getEventId(),
      accountId: financialMovement.getAccountId(),
      type: financialMovement.getType(),
      value: financialMovement.getValue(),
      createdAt: financialMovement.getCreatedAt(),
      updatedAt: financialMovement.getUpdatedAt(),
    };

    return aModel;
  }
}
