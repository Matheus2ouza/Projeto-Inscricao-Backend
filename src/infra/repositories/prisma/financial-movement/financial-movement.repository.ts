import { Injectable } from '@nestjs/common';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { PrismaService } from '../prisma.service';
import { FinancialMovementEntityToFinancialMovementPrismaModelMapper } from './model/mappers/financial-movement-entity-to-financial-movement-prisma-model.mapper';
import { FinancialMovementPrismaModelToFinancialMovementEntityMapper } from './model/mappers/financial-movement-prisma-model-to-financial-movement-entity.mapper';

@Injectable()
export class FinancialMovementRepository implements FinancialMovementGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    financialMovement: FinancialMovement,
  ): Promise<FinancialMovement> {
    const data =
      FinancialMovementEntityToFinancialMovementPrismaModelMapper.map(
        financialMovement,
      );
    const created = await this.prisma.financialMovement.create({ data });
    return FinancialMovementPrismaModelToFinancialMovementEntityMapper.map(
      created,
    );
  }
}
