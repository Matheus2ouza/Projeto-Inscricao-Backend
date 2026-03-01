import { Injectable } from '@nestjs/common';
import { CashEntryType } from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { PrismaService } from '../prisma.service';
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

  async createMany(cashRegisterEntry: CashRegisterEntry[]): Promise<void> {
    const data = cashRegisterEntry.map(EntityToPrisma.map);
    await this.prisma.cashRegisterEntry.createMany({ data });
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
