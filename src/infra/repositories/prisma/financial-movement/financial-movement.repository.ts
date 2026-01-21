import { Injectable } from '@nestjs/common';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { PrismaService } from '../prisma.service';
import { FinancialMovementEntityToFinancialMovementPrismaModelMapper as EntityToPrisma } from './model/mappers/financial-movement-entity-to-financial-movement-prisma-model.mapper';
import { FinancialMovementPrismaModelToFinancialMovementEntityMapper as PrismaToEntity } from './model/mappers/financial-movement-prisma-model-to-financial-movement-entity.mapper';

@Injectable()
export class FinancialMovementRepository implements FinancialMovementGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    financialMovement: FinancialMovement,
  ): Promise<FinancialMovement> {
    const data = EntityToPrisma.map(financialMovement);
    const created = await this.prisma.financialMovement.create({ data });
    return PrismaToEntity.map(created);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.financialMovement.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string): Promise<FinancialMovement | null> {
    const found = await this.prisma.financialMovement.findUnique({
      where: {
        id,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }
}
