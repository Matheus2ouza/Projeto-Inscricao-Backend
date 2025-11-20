import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindActiveEventsInput = {
  regionId: string;
};

export type FindActiveEventsOutput = {
  countEventsActive: number;
};

@Injectable()
export class FindActiveEventsUsecase
  implements Usecase<FindActiveEventsInput, FindActiveEventsOutput>
{
  public constructor(private readonly EventGateway: EventGateway) {}

  public async execute(
    input: FindActiveEventsInput,
  ): Promise<FindActiveEventsOutput> {
    const eventsActive = await this.EventGateway.countEventsActive(
      input.regionId,
    );

    const output: FindActiveEventsOutput = {
      countEventsActive: eventsActive,
    };
    return output;
  }
}
