import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindActiveParticipantsInput = {
  regionId: string;
};

export type FindActiveParticipantsOutput = {
  countParticipants: number;
};

@Injectable()
export class FindActiveParticipantsUsecase
  implements Usecase<FindActiveParticipantsInput, FindActiveParticipantsOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindActiveParticipantsInput,
  ): Promise<FindActiveParticipantsOutput> {
    const event = await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        countParticipants: 0,
      };
    }

    const output: FindActiveParticipantsOutput = {
      countParticipants: event.getQuantityParticipants(),
    };

    return output;
  }
}
