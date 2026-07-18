import { Injectable } from '@nestjs/common';
import { UF } from 'generated/prisma';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllLocalityWithAccountInput = {
  userId: string;
};

export type FindAllLocalityWithAccountOutput = {
  id: string;
  name: string;
  uf: UF;
}[];

@Injectable()
export class FindAllLocalityWithAccountUsecase
  implements
    Usecase<FindAllLocalityWithAccountInput, FindAllLocalityWithAccountOutput>
{
  public constructor(private readonly localityGateway: LocalityGateway) {}

  public async execute(
    input: FindAllLocalityWithAccountInput,
  ): Promise<FindAllLocalityWithAccountOutput> {
    const locality = await this.localityGateway.findByAccountId(input.userId);

    const output: FindAllLocalityWithAccountOutput = locality.map((l) => {
      return {
        id: l.getId(),
        name: l.getName(),
        uf: l.getUf(),
      };
    });

    return output;
  }
}
