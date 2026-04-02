import { Injectable } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';

export type UpdateTypeInscriptionActiveInput = {
  id: string;
  active: boolean;
};

export type UpdateTypeInscriptionActiveOutput = {
  id: string;
  active: boolean;
};

@Injectable()
export class UpdateTypeInscriptionActiveUsecase
  implements
    Usecase<UpdateTypeInscriptionActiveInput, UpdateTypeInscriptionActiveOutput>
{
  constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: UpdateTypeInscriptionActiveInput,
  ): Promise<UpdateTypeInscriptionActiveOutput> {
    const typeInscription = await this.typeInscriptionGateway.findById(
      input.id,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `Attempt to disable the subscription type, but none were found with the ID: ${input.id}`,
        `Nenhum tipo de inscrição encontrado`,
        UpdateTypeInscriptionActiveUsecase.name,
      );
    }

    typeInscription.updateActive(input.active);
    this.typeInscriptionGateway.update(typeInscription);

    const output: UpdateTypeInscriptionActiveOutput = {
      id: typeInscription.getId(),
      active: typeInscription.getActive(),
    };

    return output;
  }
}
