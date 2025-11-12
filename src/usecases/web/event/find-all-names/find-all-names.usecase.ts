import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';

export type FindAllNamesEventOutput = {
  id: string;
  name: string;
}[];

@Injectable()
export class FindAllnamesEventUsecase {
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(): Promise<FindAllNamesEventOutput> {
    const allEventsName = await this.eventGateway.findAll();

    const output: FindAllNamesEventOutput = allEventsName.map((eventsName) => ({
      id: eventsName.getId(),
      name: eventsName.getName(),
    }));

    return output;
  }
}
