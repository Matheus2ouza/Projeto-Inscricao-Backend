import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindActiveEventsAdminInput = {
  regionId: string;
};

export type FindActiveEventsAdminOutput = {
  countEventsActive: number;
};

@Injectable()
export class FindActiveEventsAdminUsecase
  implements Usecase<FindActiveEventsAdminInput, FindActiveEventsAdminOutput>
{
  public constructor(private readonly EventGateway: EventGateway) {}

  public async execute(
    input: FindActiveEventsAdminInput,
  ): Promise<FindActiveEventsAdminOutput> {
    const eventsActive = await this.EventGateway.countEventsActive(
      input.regionId,
    );

    const output: FindActiveEventsAdminOutput = {
      countEventsActive: eventsActive,
    };
    return output;
  }
}
