import { Injectable } from '@nestjs/common';
import { CashRegisterStatus } from 'generated/prisma';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllCashRegisterInput = {
  regionId?: string;
};

export type FindAllCashRegisterOutput = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  balance: number;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
}[];

@Injectable()
export class FindAllCashRegisterUsecase
  implements Usecase<FindAllCashRegisterInput, FindAllCashRegisterOutput>
{
  constructor(private readonly cashRegisterGateway: CashRegisterGateway) {}

  async execute(
    input: FindAllCashRegisterInput,
  ): Promise<FindAllCashRegisterOutput> {
    const filters = {
      regionId: input.regionId,
    };
    const cashRegisters = await this.cashRegisterGateway.findMany(filters);

    const output: FindAllCashRegisterOutput = cashRegisters.map((c) => ({
      id: c.getId(),
      name: c.getName(),
      status: c.getStatus(),
      balance: c.getBalance(),
      openedAt: c.getOpenedAt(),
      closedAt: c.getClosedAt(),
      createdAt: c.getCreatedAt(),
    }));

    return output;
  }
}
