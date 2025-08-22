import { Injectable } from '@nestjs/common';
import { Locality } from 'src/domain/entities/locality.entity';
import { LocalityGateway } from 'src/domain/repositories/locality.geteway';
import { LocalityAlreadyExistsUsecaseException } from 'src/usecases/exceptions/locality-already-exists.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreateLocalityInput = {
  locality: string;
  password: string;
};

export type CreateLocalityOutput = {
  id: string;
};

@Injectable()
export class CreateLocalityUsecase
  implements Usecase<CreateLocalityInput, CreateLocalityOutput>
{
  public constructor(private readonly localityGateway: LocalityGateway) {}

  public async execute({
    locality,
    password,
  }: CreateLocalityInput): Promise<CreateLocalityOutput> {
    const localityExists = await this.localityGateway.findBylocality(locality);

    if (localityExists) {
      throw new LocalityAlreadyExistsUsecaseException(
        `Locality already exists while creating locality with locality: ${locality}`,
        `A localidade ${locality} já existe`,
        CreateLocalityUsecase.name
      )
    }

    const anLocality = Locality.create({locality, password});

    await this.localityGateway.create(anLocality);

    const output: CreateLocalityOutput = {
      id: anLocality.getId(),
    }

    return output
  }
}
