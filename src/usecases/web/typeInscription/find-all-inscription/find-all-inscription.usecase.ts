import { Injectable } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';

export type FindAllTypeInscriptionOutput = {
  id: string;
  description: string;
  value: number;
}[];

@Injectable()
export class FindAllTypeInscriptionUsecase {
  public constructor(
    private readonly typeinscriptionGateway: TypeInscriptionGateway,
  ) {}

  public async execute(): Promise<FindAllTypeInscriptionOutput> {
    const anTypeInscriptions =
      await this.typeinscriptionGateway.findAllDescription();

    const output: FindAllTypeInscriptionOutput = anTypeInscriptions.map(
      (typeInscription) => ({
        id: typeInscription.getId(),
        description: typeInscription.getDescription(),
        value: typeInscription.getValue(),
      }),
    );

    return output;
  }
}
