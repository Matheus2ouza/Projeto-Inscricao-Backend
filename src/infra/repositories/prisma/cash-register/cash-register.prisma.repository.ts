import { Injectable } from '@nestjs/common';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { PrismaService } from '../prisma.service';
import { CashRegisterEntityToCashRegisterPrismaModelMapper as EntityToPrisma } from './model/mapper/cash-register-entity-to-cash-register-prisma-model.mapper';
import { CashRegisterPrismaModelToCashRegisterEntityMapper as PrismaToEntity } from './model/mapper/cash-register-prisma-model-to-cash-register-entity.mapper';

@Injectable()
export class CashRegisterPrismaRepository implements CashRegisterGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(cashRegister: CashRegister): Promise<CashRegister> {
    const data = EntityToPrisma.map(cashRegister);
    const created = await this.prisma.cashRegister.create({ data });
    return PrismaToEntity.map(created);
  }

  async update(cashRegister: CashRegister): Promise<CashRegister> {
    const data = EntityToPrisma.map(cashRegister);
    const updated = await this.prisma.cashRegister.update({
      where: { id: cashRegister.getId() },
      data,
    });
    return PrismaToEntity.map(updated);
  }

  async findById(id: string): Promise<CashRegister | null> {
    const found = await this.prisma.cashRegister.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findMany(filters: { regionId?: string }): Promise<CashRegister[]> {
    const where = this.buildWhereClauseCashRegister(filters);
    const found = await this.prisma.cashRegister.findMany({
      where,
    });

    return found.map(PrismaToEntity.map);
  }

  private buildWhereClauseCashRegister(filters: { regionId?: string }) {
    const { regionId } = filters || {};

    return {
      regionId,
    };
  }
}
