import { Injectable } from '@nestjs/common';
import { CashRegisterStatus, PaymentMethod } from 'generated/prisma';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
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
  totalIncome: number;
  totalExpense: number;
  totalPix: number;
  totalCard: number;
  totalCash: number;
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
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
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

    const [events, totalIncome, totalExpense, totalPix, totalCard, totalCash] =
      await Promise.all([
        this.eventGateway.findByCashRegisterId(cashRegister.getId()),
        this.cashRegisterEntryGateway.sumTotalIncome(cashRegister.getId()),
        this.cashRegisterEntryGateway.sumTotalExpense(cashRegister.getId()),
        this.cashRegisterEntryGateway.sumTotalByMethod(
          cashRegister.getId(),
          PaymentMethod.PIX,
        ),
        this.cashRegisterEntryGateway.sumTotalByMethod(
          cashRegister.getId(),
          PaymentMethod.CARTAO,
        ),
        this.cashRegisterEntryGateway.sumTotalByMethod(
          cashRegister.getId(),
          PaymentMethod.DINHEIRO,
        ),
      ]);

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
      totalIncome,
      totalExpense,
      totalPix,
      totalCard,
      totalCash,
      openedAt: cashRegister.getOpenedAt(),
      closedAt: cashRegister.getClosedAt(),
    };

    return output;
  }
}
