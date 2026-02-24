import { Provider } from '@nestjs/common';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { FinancialMovementRepository } from '../financial-movement.repository';

export const FinancialMovementPrismaRepositoryProvider: Provider = {
  provide: FinancialMovementGateway,
  useClass: FinancialMovementRepository,
};
