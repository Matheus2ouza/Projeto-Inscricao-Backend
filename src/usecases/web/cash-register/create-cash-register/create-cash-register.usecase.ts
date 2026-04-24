import { Injectable } from '@nestjs/common';
import { CashRegisterStatus } from 'generated/prisma';
import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { Usecase } from 'src/usecases/usecase';
import { RegionNotFoundUsecaseException } from '../../exceptions/accounts/region-not-found.usecase.exception';

export type CreateCashRegisterInput = {
  name: string;
  regionId?: string;
  status: CashRegisterStatus;
  initialBalance: number;
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
    private readonly regionGateway: RegionGateway,
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: CreateCashRegisterInput,
  ): Promise<CreateCashRegisterOutout> {
    // valida se a região existe, caso contrário lança uma exceção
    if (!input.regionId) {
      throw new RegionNotFoundUsecaseException(
        `Attempt to register a new entry at the checkout, but the region could not be found.`,
        `Região não encontrada. Verifique os dados e tente novamente.`,
        CreateCashRegisterUsecase.name,
      );
    }

    const region = await this.regionGateway.findById(input.regionId);
    if (!region) {
      throw new RegionNotFoundUsecaseException(
        `Attempt to register a new entry at the checkout, but the region could not be found.`,
        `Região não encontrada. Verifique os dados e tente novamente.`,
        CreateCashRegisterUsecase.name,
      );
    }
    // cria o caixa com os dados passados pelo input
    const cashRegister = CashRegister.create({
      name: input.name,
      regionId: region.getId(),
      status: input.status,
      initialBalance: input.initialBalance,
      balance: input.balance,
    });

    // busca o evento para associar ao caixa
    const event = await this.eventGateway.findById(input.allocationEvent);

    // se não encontrar o evento então cria o caixa normalmente,
    // mas retorna uma mensagem avisando que o evento não foi encontrado e o caixa não foi associado a nenhum evento
    if (!event) {
      await this.prisma.runInTransaction(async (tx) => {
        await this.cashRegisterGateway.createTx(cashRegister, tx);
      });

      const output: CreateCashRegisterOutout = {
        id: cashRegister.getId(),
        message: `Caixa criado com sucesso, porém o evento passado não foi encontrado, logo o caixa não foi associado a nenhum evento.`,
      };

      return output;
    }

    // se o evento for encontrado associa ao evento passado pelo usuario
    const cashRegisterEvent = CashRegisterEvent.create({
      cashRegisterId: cashRegister.getId(),
      eventId: event.getId(),
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.cashRegisterGateway.createTx(cashRegister, tx);
      await this.cashRegisterEventGateway.createTx(cashRegisterEvent, tx);
    });

    const output: CreateCashRegisterOutout = {
      id: cashRegister.getId(),
    };
    return output;
  }
}
