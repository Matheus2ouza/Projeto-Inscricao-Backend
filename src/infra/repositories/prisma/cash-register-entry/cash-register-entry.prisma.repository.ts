import { Injectable } from '@nestjs/common';
import { CashEntryType, PaymentMethod } from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { CashRegisterEntryEntityToCashRegisterEntryPrismaModelMapper as EntityToPrisma } from './model/mapper/cash-register-entry-entity-to-cash-register-entry-prisma-model.mapper';
import { CashRegisterEntryPrismaModelToCashRegisterEntryEntityMapper as PrismaToEntity } from './model/mapper/cash-register-entry-prisma-model-to-cash-register-entry-entity.mapper';

@Injectable()
export class CashRegisterEntryPrismaRepository
  implements CashRegisterEntryGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(entry: CashRegisterEntry): Promise<CashRegisterEntry> {
    const data = EntityToPrisma.map(entry);
    const created = await this.prisma.cashRegisterEntry.create({ data });
    return PrismaToEntity.map(created);
  }

  async createTx(
    entry: CashRegisterEntry,
    tx: PrismaTransactionClient,
  ): Promise<CashRegisterEntry> {
    const data = EntityToPrisma.map(entry);
    const created = await tx.cashRegisterEntry.create({ data });
    return PrismaToEntity.map(created);
  }

  async createMany(cashRegisterEntry: CashRegisterEntry[]): Promise<void> {
    const data = cashRegisterEntry.map(EntityToPrisma.map);
    await this.prisma.cashRegisterEntry.createMany({ data });
  }

  async createManyTx(
    cashRegisterEntry: CashRegisterEntry[],
    tx: PrismaTransactionClient,
  ): Promise<void> {
    const data = cashRegisterEntry.map(EntityToPrisma.map);
    await tx.cashRegisterEntry.createMany({ data });
  }

  async findById(id: string): Promise<CashRegisterEntry | null> {
    const found = await this.prisma.cashRegisterEntry.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findManyPaginated(
    cashRegisterId: string,
    page: number,
    pageSize: number,
    filters?: {
      type?: CashEntryType | CashEntryType[];
      limitTime?: string;
      orderBy?: 'desc' | 'asc';
    },
  ): Promise<CashRegisterEntry[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClauseCashRegisterEntry(filters);
    const sortOrder = filters?.orderBy === 'asc' ? 'asc' : 'desc';
    const found = await this.prisma.cashRegisterEntry.findMany({
      where: {
        cashRegisterId,
        ...where,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: sortOrder },
    });
    return found.map(PrismaToEntity.map);
  }

  async countAll(
    cashRegisterId: string,
    filters?: {
      type?: CashEntryType | CashEntryType[];
      limitTime?: string;
      orderBy?: 'desc' | 'asc';
    },
  ): Promise<number> {
    const where = this.buildWhereClauseCashRegisterEntry(filters);
    const count = await this.prisma.cashRegisterEntry.count({
      where: { cashRegisterId, ...where },
    });

    return count;
  }

  async sumTotalIncome(cashRegisterId: string): Promise<number> {
    const sum = await this.prisma.cashRegisterEntry.aggregate({
      where: { cashRegisterId, type: CashEntryType.INCOME },
      _sum: {
        value: true,
      },
    });

    return sum._sum.value?.toNumber() || 0;
  }

  async sumTotalExpense(cashRegisterId: string): Promise<number> {
    const sum = await this.prisma.cashRegisterEntry.aggregate({
      where: {
        cashRegisterId,
        type: CashEntryType.EXPENSE,
      },
      _sum: {
        value: true,
      },
    });

    return sum._sum.value?.toNumber() || 0;
  }

  async sumTotalByMethod(
    cashRegisterId: string,
    method: PaymentMethod,
  ): Promise<number> {
    const sum = await this.prisma.cashRegisterEntry.aggregate({
      where: {
        cashRegisterId,
        method,
        type: CashEntryType.INCOME,
      },
      _sum: {
        value: true,
      },
    });

    return sum._sum.value?.toNumber() || 0;
  }

  private buildWhereClauseCashRegisterEntry(filters?: {
    type?: CashEntryType | CashEntryType[];
    limitTime?: string;
  }) {
    const { type, limitTime } = filters || {};

    const typeArray = type ? (Array.isArray(type) ? type : [type]) : [];

    return {
      type: typeArray && typeArray.length > 0 ? { in: typeArray } : undefined,
      createdAt: limitTime ? { gte: new Date(limitTime) } : undefined,
    };
  }
}
