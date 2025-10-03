import { Inject, Injectable } from '@nestjs/common';
import { Region } from 'src/domain/entities/region.entity';
import type { RegionGateway } from 'src/domain/repositories/region.gateway';

@Injectable()
export class CreateRegionUseCase {
  constructor(
    @Inject('RegionGateway') private readonly regionGateway: RegionGateway,
  ) {}

  async execute(input: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<Region> {
    // Regra: apenas SUPER pode criar (validar no controller/guard)
    const region = Region.create(input);
    return this.regionGateway.create(region);
  }
}
