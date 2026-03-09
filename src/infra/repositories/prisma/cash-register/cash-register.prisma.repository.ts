import { Injectable } from '@nestjs/common';
import { CashRegisterStatus } from 'generated/prisma';
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

  async findMany(
    page: number,
    pageSize: number,
    filters: { regionId?: string; status?: CashRegisterStatus[] },
  ): Promise<CashRegister[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClauseCashRegister(filters);
    const found = await this.prisma.cashRegister.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    return found.map(PrismaToEntity.map);
  }

  async count(filters: {
    regionId?: string;
    status?: CashRegisterStatus[];
  }): Promise<number> {
    const where = this.buildWhereClauseCashRegister(filters);
    const count = await this.prisma.cashRegister.count({
      where,
    });
    return count;
  }

  private buildWhereClauseCashRegister(filters: {
    regionId?: string;
    status?: CashRegisterStatus[];
  }) {
    const { regionId, status } = filters || {};

    const statusArray = status
      ? Array.isArray(status)
        ? status
        : [status]
      : [];

    return {
      regionId,
      status:
        statusArray && statusArray.length > 0 ? { in: statusArray } : undefined,
    };
  }
}
