import { Injectable } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';

export type FindAllInscriptionOutput = {
  id: string;
  description: string;
  value: number;
}[];

@Injectable()
export class FindAllInscriptionUsecase {
  public constructor(
    private readonly typeinscriptionGateway: TypeInscriptionGateway,
  ) {}

  public async execute(): Promise<FindAllInscriptionOutput> {
    const anTypeInscriptions =
      await this.typeinscriptionGateway.findAllDescription();

    const output: FindAllInscriptionOutput = anTypeInscriptions.map(
      (typeInscription) => ({
        id: typeInscription.getId(),
        description: typeInscription.getDescription(),
        value: typeInscription.getValue(),
      }),
    );

    return output;
  }
}
