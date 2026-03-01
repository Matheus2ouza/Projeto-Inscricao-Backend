import { Injectable } from '@nestjs/common';
import { CashRegisterStatus } from 'generated/prisma';
import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type CreateCashRegisterInput = {
  name: string;
  regionId: string;
  status: CashRegisterStatus;
  balance: number;
  allocationEvent: string;
};

export type CreateCashRegisterOutout = {
  id: string;
  message?: string;
};

@Injectable()
export class CreateCashRegisterUsecase
  implements Usecase<CreateCashRegisterInput, CreateCashRegisterOutout>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
  ) {}

  async execute(
    input: CreateCashRegisterInput,
  ): Promise<CreateCashRegisterOutout> {
    // cria o caixa com os dados passados pelo input
    const cashRegister = CashRegister.create({
      name: input.name,
      regionId: input.regionId,
      status: input.status,
      balance: input.balance,
    });
    await this.cashRegisterGateway.create(cashRegister);

    const event = await this.eventGateway.findById(input.allocationEvent);

    // Caso o id do evento passo pelo usuario seja um id de um evento valido
    // então referencia o caixa ao evento
    let cashRegisterEvent: CashRegisterEvent | null = null;
    if (event) {
      cashRegisterEvent = CashRegisterEvent.create({
        cashRegisterId: cashRegister.getId(),
        eventId: event.getId(),
      });
      await this.cashRegisterEventGateway.create(cashRegisterEvent);
    }

    const output: CreateCashRegisterOutout = {
      id: cashRegister.getId(),
      message: cashRegisterEvent
        ? undefined
        : 'Caixa criado mas não pode ser alocado ao evento',
    };
    return output;
  }
}
