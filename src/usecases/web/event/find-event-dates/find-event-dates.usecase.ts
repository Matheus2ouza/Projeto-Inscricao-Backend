import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindEventDateInput = {
  regionId: string;
};

export type FindEventDateOutput = {
  events: {
    id: string;
    name: string;
    status: string;
    startDate: Date;
    endDate: Date;
  }[];
};

@Injectable()
export class FindEventDateUsecase
  implements Usecase<FindEventDateInput, FindEventDateOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindEventDateInput,
  ): Promise<FindEventDateOutput> {
    const events = await this.eventGateway.findEventDates(input.regionId);

    const eventsMaps = events.map((event) => ({
      id: event.getId(),
      name: event.getName(),
      status: event.getStatus(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
    }));

    const output: FindEventDateOutput = {
      events: eventsMaps,
    };

    return output;
  }
}
