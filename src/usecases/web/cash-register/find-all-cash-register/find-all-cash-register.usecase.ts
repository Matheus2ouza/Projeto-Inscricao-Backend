import { Injectable } from '@nestjs/common';
import { CashRegisterStatus } from 'generated/prisma';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllCashRegisterInput = {
  regionId?: string;
  status?: CashRegisterStatus[];
  page?: number;
  pageSize?: number;
};

export type FindAllCashRegisterOutput = {
  cashRegisters: CashRegister[];
  total: number;
  page: number;
  pageCount: number;
};

type CashRegister = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  balance: number;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
};

@Injectable()
export class FindAllCashRegisterUsecase
  implements Usecase<FindAllCashRegisterInput, FindAllCashRegisterOutput>
{
  constructor(private readonly cashRegisterGateway: CashRegisterGateway) {}

  async execute(
    input: FindAllCashRegisterInput,
  ): Promise<FindAllCashRegisterOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const filters = {
      regionId: input.regionId,
      status: input.status,
    };

    const [cashRegisters, total] = await Promise.all([
      this.cashRegisterGateway.findMany(safePage, safePageSize, filters),
      this.cashRegisterGateway.count(filters),
    ]);

    const cashRegisterOutput: CashRegister[] = cashRegisters.map((c) => ({
      id: c.getId(),
      name: c.getName(),
      status: c.getStatus(),
      balance: c.getBalance(),
      openedAt: c.getOpenedAt(),
      closedAt: c.getClosedAt(),
      createdAt: c.getCreatedAt(),
    }));

    const output: FindAllCashRegisterOutput = {
      cashRegisters: cashRegisterOutput,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }
}
