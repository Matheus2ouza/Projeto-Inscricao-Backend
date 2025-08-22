import { Injectable } from "@nestjs/common";
import { LocalityGateway } from "src/domain/repositories/locality.geteway";
import { LocalityNotFoundUsecaseException } from "src/usecases/exceptions/locality-not-found.usecase.exception";
import { Usecase } from "src/usecases/usecase";

export type findLocalityInput = {
  id: string;
}

export type FindLocalityOutput = {
  id: string;
  locality: string;
  role: string;
  outstanding_balance: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FindLocalityUsecase implements Usecase<findLocalityInput, FindLocalityOutput> {
  public constructor(private readonly localityGateway: LocalityGateway) {}

  public async execute({ id }: findLocalityInput): Promise<FindLocalityOutput> {
    const anLocality = await this.localityGateway.findById(id);

    if (!anLocality) {
      throw new LocalityNotFoundUsecaseException(
        `Locality not found with finding locality with id ${id} in ${FindLocalityUsecase.name}`,
        `Usuário não encontrado com o id ${id} no ${FindLocalityUsecase.name}`,
        FindLocalityUsecase.name,
      )
    }
    const output: FindLocalityOutput= {
      id: anLocality.getId(),
      locality: anLocality.getLocality(),
      role: anLocality.getRole(),
      outstanding_balance: anLocality.getOutstandingBalance(),
      createdAt: anLocality.getCreatedAt(),
      updatedAt: anLocality.getUpdatedAt(),
    }

    return output;
  }
}