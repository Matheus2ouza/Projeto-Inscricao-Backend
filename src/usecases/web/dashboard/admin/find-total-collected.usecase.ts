import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalCollectedInput = {
  regionId: string;
};

export type FindTotalCollectedOutput = {
  totalCollected: number;
};

@Injectable()
export class FindTotalCollectedUsecase
  implements Usecase<FindTotalCollectedInput, FindTotalCollectedOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindTotalCollectedInput,
  ): Promise<FindTotalCollectedOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalCollected: 0,
      };
    }

    const output: FindTotalCollectedOutput = {
      totalCollected: event.getAmountCollected(),
    };

    return output;
  }
}
