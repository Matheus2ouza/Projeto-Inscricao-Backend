import { Usecase } from 'src/usecases/usecase';

import { EventGateway } from 'src/domain/repositories/event.gateway';

import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';

export type FindTotalDebtUserInput = {
  accountId: string;
  regionId: string;
};

export type FindTotalDebtUserOutput = {
  countTotalDebt: number;
  countTotalPaid: number;
  debtCompletionPercentage: number;
};

@Injectable()
export class FindTotalDebtUserUsecase
  implements Usecase<FindTotalDebtUserInput, FindTotalDebtUserOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(
    input: FindTotalDebtUserInput,
  ): Promise<FindTotalDebtUserOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        countTotalDebt: 0,
        countTotalPaid: 0,
        debtCompletionPercentage: 0,
      };
    }

    const [totalDebt] = await Promise.all([
      this.inscriptionGateway.countTotalDebt(event.getId(), input.accountId),
    ]);

    let debtCompletionPercentage = 0;

    if (debtCompletionPercentage > 100) {
      debtCompletionPercentage = 100;
    }
    debtCompletionPercentage = Number(debtCompletionPercentage.toFixed(2));

    const output: FindTotalDebtUserOutput = {
      countTotalDebt: totalDebt,
      countTotalPaid: 0,
      debtCompletionPercentage,
    };

    return output;
  }
}
