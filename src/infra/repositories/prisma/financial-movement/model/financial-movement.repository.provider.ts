import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { FinancialMovementRepository } from '../financial-movement.repository';

export const FinancialMovementPrismaRepositoryProvider = {
  provide: FinancialMovementGateway,
  useClass: FinancialMovementRepository,
};
