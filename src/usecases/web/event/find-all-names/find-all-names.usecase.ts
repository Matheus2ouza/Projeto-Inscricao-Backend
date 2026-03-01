import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllNamesEventInput = {
  regionId?: string;
};

export type FindAllNamesEventOutput = {
  id: string;
  name: string;
}[];

@Injectable()
export class FindAllnamesEventUsecase
  implements Usecase<FindAllNamesEventInput, FindAllNamesEventOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  public async execute(
    input: FindAllNamesEventInput,
  ): Promise<FindAllNamesEventOutput> {
    const filters = {
      regionId: input.regionId,
    };

    const allEventsName = await this.eventGateway.findAll(filters);

    const output: FindAllNamesEventOutput = allEventsName.map((e) => ({
      id: e.getId(),
      name: e.getName(),
    }));

    return output;
  }
}
