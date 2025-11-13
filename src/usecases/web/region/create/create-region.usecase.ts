import { Injectable } from '@nestjs/common';
import { Region } from 'src/domain/entities/region.entity';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { Usecase } from 'src/usecases/usecase';
import { RegionAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/regions/region-already-exists.usecase.exception';

export type CreateRegionInput = {
  name: string;
};

export type CreateRegionOutput = {
  id: string;
};

@Injectable()
export class CreateRegionUseCase
  implements Usecase<CreateRegionInput, CreateRegionOutput>
{
  public constructor(private readonly regionGateway: RegionGateway) {}

  public async execute({
    name,
  }: CreateRegionInput): Promise<CreateRegionOutput> {
    const regionExists = await this.regionGateway.findByName(name);
    if (regionExists) {
      throw new RegionAlreadyExistsUsecaseException(
        `Region already exists while creating region with name ${name}`,
        `A região ${name} já existe`,
        CreateRegionUseCase.name,
      );
    }

    const region = Region.create({ name });

    await this.regionGateway.create(region);

    const output: CreateRegionOutput = {
      id: region.getId(),
    };

    return output;
  }
}
