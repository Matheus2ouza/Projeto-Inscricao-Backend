import { Injectable } from '@nestjs/common';
import { RegionGateway } from 'src/domain/repositories/region.gateway';

export type FindAllRegionsOutput = {
  id: string;
  name: string;
}[];

@Injectable()
export class FindAllRegionNamesUsecase {
  public constructor(private readonly regionGateway: RegionGateway) {}

  public async execute(): Promise<FindAllRegionsOutput> {
    const regions = await this.regionGateway.findAllNames();

    const output: FindAllRegionsOutput = regions.map((region) => ({
      id: region.getId(),
      name: region.getName(),
    }));

    return output;
  }
}
