import { Logger } from '@nestjs/common';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncCashRegisterInput = {
  cashRegister: CashRegister;
};

export type ReceiveSyncCashRegisterOutput = {
  id: string;
  operation: 'created' | 'updated';
};

export class ReceiveSyncCashRegisterUsecase
  implements
    Usecase<ReceiveSyncCashRegisterInput, ReceiveSyncCashRegisterOutput>
{
  private readonly logger = new Logger(ReceiveSyncCashRegisterUsecase.name);
  constructor(private readonly cashRegisterGateway: CashRegisterGateway) {}

  async execute(
    input: ReceiveSyncCashRegisterInput,
  ): Promise<ReceiveSyncCashRegisterOutput> {
    const cashRegister = input.cashRegister;

    this.logger.log('Validando se o caixa já existe no banco');
    const existingCashRegister = await this.cashRegisterGateway.findById(
      cashRegister.getId(),
    );

    this.logger.log(
      `Caixa ${cashRegister.getId()} ${existingCashRegister ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    await this.cashRegisterGateway.upsert(cashRegister);

    this.logger.log(`Inscrição sincronizada: ${cashRegister.getId()}`);
    const output: ReceiveSyncCashRegisterOutput = {
      id: cashRegister.getId(),
      operation: existingCashRegister ? 'updated' : 'created',
    };

    return output;
  }
}
