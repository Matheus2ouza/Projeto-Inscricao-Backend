import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalCollectedSuperInput = {
  regionId: string;
  eventId?: string;
};

export type FindTotalCollectedSuperOutput = {
  totalCollected: number;
  totalNetValueCollected: number;
};

@Injectable()
export class FindTotalCollectedSuperUsecase
  implements
    Usecase<FindTotalCollectedSuperInput, FindTotalCollectedSuperOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindTotalCollectedSuperInput,
  ): Promise<FindTotalCollectedSuperOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalCollected: 0,
        totalNetValueCollected: 0,
      };
    }

    const output: FindTotalCollectedSuperOutput = {
      totalCollected: event.getAmountCollected(),
      totalNetValueCollected: event.getAmountNetValueCollected(),
    };

    return output;
  }
}
