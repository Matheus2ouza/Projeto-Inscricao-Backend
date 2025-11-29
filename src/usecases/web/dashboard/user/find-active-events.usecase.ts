import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindActiveEventsUserInput = {
  regionId: string;
};

export type FindActiveEventsUserOutput = {
  activeEvents: number;
};

@Injectable()
export class FindActiveEventsUserUsecase
  implements Usecase<FindActiveEventsUserInput, FindActiveEventsUserOutput>
{
  public constructor(private readonly EventGateway: EventGateway) {}

  public async execute(
    input: FindActiveEventsUserInput,
  ): Promise<FindActiveEventsUserOutput> {
    const eventsActive = await this.EventGateway.countEventsActive(
      input.regionId,
    );

    const output: FindActiveEventsUserOutput = {
      activeEvents: eventsActive,
    };
    return output;
  }
}
