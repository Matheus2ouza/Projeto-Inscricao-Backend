import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalDebtAdminInput = {
  regionId: string;
};

export type FindTotalDebtAdminOutput = {
  totalDebt: number;
};

@Injectable()
export class FindTotalDebtAdminUsecase
  implements Usecase<FindTotalDebtAdminInput, FindTotalDebtAdminOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  public async execute(
    input: FindTotalDebtAdminInput,
  ): Promise<FindTotalDebtAdminOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalDebt: 0,
      };
    }

    const totalDebt = await this.inscriptionGateway.contTotalDebtByEvent(
      event.getId(),
    );

    const output: FindTotalDebtAdminOutput = {
      totalDebt,
    };

    return output;
  }
}
