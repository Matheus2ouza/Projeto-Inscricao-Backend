import { Injectable } from '@nestjs/common';
import { CashRegisterStatus } from 'generated/prisma';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';
import { CashRegisterNotFoundUsecaseException } from '../../exceptions/cash-register/cash-register-not-found.usecase.exception';

export type FindDetailsCashRegisterInput = {
  id: string;
};

export type FindDetailsCashRegisterOutput = {
  id: string;
  name: string;
  status: CashRegisterStatus;
  balance: number;
  allocationEvents: AllocationEvent[];
  openedAt: Date;
  closedAt?: Date;
};

type AllocationEvent = {
  id: string;
  name: string;
};

@Injectable()
export class FindDetailsCashRegisterUsecase
  implements
    Usecase<FindDetailsCashRegisterInput, FindDetailsCashRegisterOutput>
{
  constructor(
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  async execute(
    input: FindDetailsCashRegisterInput,
  ): Promise<FindDetailsCashRegisterOutput> {
    const cashRegister = await this.cashRegisterGateway.findById(input.id);

    if (!cashRegister) {
      throw new CashRegisterNotFoundUsecaseException(
        `An attempt was made to search for the cashier by ID: ${input.id}, but no results were returned.`,
        `Nenhum caixa encontrado`,
        FindDetailsCashRegisterUsecase.name,
      );
    }

    const events = await this.eventGateway.findByCashRegisterId(
      cashRegister.getId(),
    );

    const allocationEvents: AllocationEvent[] = events.map((e) => ({
      id: e.getId(),
      name: e.getName(),
    }));

    const output: FindDetailsCashRegisterOutput = {
      id: cashRegister.getId(),
      name: cashRegister.getName(),
      status: cashRegister.getStatus(),
      balance: cashRegister.getBalance(),
      allocationEvents,
      openedAt: cashRegister.getOpenedAt(),
      closedAt: cashRegister.getClosedAt(),
    };

    return output;
  }
}
