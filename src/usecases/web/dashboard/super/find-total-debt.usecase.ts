import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalDebtSuperInput = {
  regionId: string;
  eventId?: string;
};

export type FindTotalDebtSuperOutput = {
  totalDebt: number;
};

@Injectable()
export class FindTotalDebtSuperUsecase
  implements Usecase<FindTotalDebtSuperInput, FindTotalDebtSuperOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  public async execute(
    input: FindTotalDebtSuperInput,
  ): Promise<FindTotalDebtSuperOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalDebt: 0,
      };
    }

    const totalDebt = await this.inscriptionGateway.contTotalDebtByEvent(
      event.getId(),
    );

    const output: FindTotalDebtSuperOutput = {
      totalDebt,
    };

    return output;
  }
}
