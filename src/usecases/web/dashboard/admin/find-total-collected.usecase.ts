import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalCollectedAdminInput = {
  regionId: string;
};

export type FindTotalCollectedAdminOutput = {
  totalCollected: number;
};

@Injectable()
export class FindTotalCollectedAdminUsecase
  implements
    Usecase<FindTotalCollectedAdminInput, FindTotalCollectedAdminOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  public async execute(
    input: FindTotalCollectedAdminInput,
  ): Promise<FindTotalCollectedAdminOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalCollected: 0,
      };
    }

    const output: FindTotalCollectedAdminOutput = {
      totalCollected: event.getAmountCollected(),
    };

    return output;
  }
}
