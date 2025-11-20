import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalDebtInput = {
  regionId: string;
};

export type FindTotalDebtOutput = {
  totalDebt: number;
};

@Injectable()
export class FindTotalDebtUsecase
  implements Usecase<FindTotalDebtInput, FindTotalDebtOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  public async execute(
    input: FindTotalDebtInput,
  ): Promise<FindTotalDebtOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalDebt: 0,
      };
    }

    const totalDebt = await this.inscriptionGateway.contTotalDebtByEvent(
      event.getId(),
    );

    const output: FindTotalDebtOutput = {
      totalDebt,
    };

    return output;
  }
}
