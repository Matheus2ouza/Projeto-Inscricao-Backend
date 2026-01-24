import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindActiveParticipantsAdminInput = {
  regionId: string;
  eventId?: string;
};

export type FindActiveParticipantsAdminOutput = {
  countParticipants: number;
};

@Injectable()
export class FindActiveParticipantsAdminUsecase
  implements
    Usecase<FindActiveParticipantsAdminInput, FindActiveParticipantsAdminOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindActiveParticipantsAdminInput,
  ): Promise<FindActiveParticipantsAdminOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        countParticipants: 0,
      };
    }

    const output: FindActiveParticipantsAdminOutput = {
      countParticipants: event.getQuantityParticipants(),
    };

    return output;
  }
}
