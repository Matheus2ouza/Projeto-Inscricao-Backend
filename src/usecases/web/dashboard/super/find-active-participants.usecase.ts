import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindActiveParticipantsSuperInput = {
  regionId: string;
  eventId?: string;
};

export type FindActiveParticipantsSuperOutput = {
  countParticipants: number;
};

@Injectable()
export class FindActiveParticipantsSuperUsecase
  implements
    Usecase<FindActiveParticipantsSuperInput, FindActiveParticipantsSuperOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindActiveParticipantsSuperInput,
  ): Promise<FindActiveParticipantsSuperOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        countParticipants: 0,
      };
    }

    const output: FindActiveParticipantsSuperOutput = {
      countParticipants: event.getQuantityParticipants(),
    };

    return output;
  }
}
