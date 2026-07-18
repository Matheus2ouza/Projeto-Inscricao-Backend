import { Injectable } from '@nestjs/common';
import { UF } from 'generated/prisma';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllLocalityOutput = {
  id: string;
  name: string;
  uf: UF;
}[];

@Injectable()
export class FindAllLocalityUsecase
  implements Usecase<void, FindAllLocalityOutput>
{
  public constructor(private readonly localityGateway: LocalityGateway) {}

  public async execute(): Promise<FindAllLocalityOutput> {
    const localities = await this.localityGateway.findAll();

    const output: FindAllLocalityOutput = localities.map((l) => {
      return {
        id: l.getId(),
        name: l.getName(),
        uf: l.getUf(),
      };
    });

    return output;
  }
}
