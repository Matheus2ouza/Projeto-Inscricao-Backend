import { Injectable } from '@nestjs/common';
import { RegionGateway } from 'src/domain/repositories/region.gateway';

export type FindAllNamesOutput = {
  id: string;
  name: string;
}[];

@Injectable()
export class FindAllNamesUsecase {
  public constructor(private readonly regionGateway: RegionGateway) {}

  public async execute(): Promise<FindAllNamesOutput> {
    const regions = await this.regionGateway.findAllNames();

    const output: FindAllNamesOutput = regions.map((region) => ({
      id: region.getId(),
      name: region.getName(),
    }));

    return output;
  }
}
