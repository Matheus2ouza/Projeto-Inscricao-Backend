import { Injectable } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';

export type UpdateTypeInscriptionInput = {
  id: string;
  description: string;
  value: number;
  specialType: boolean;
};

export type UpdateTypeInscriptionOutput = {
  id: string;
};

@Injectable()
export class UpdateTypeInscriptionUsecase
  implements Usecase<UpdateTypeInscriptionInput, UpdateTypeInscriptionOutput>
{
  public constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  public async execute(
    input: UpdateTypeInscriptionInput,
  ): Promise<UpdateTypeInscriptionOutput> {
    const typeInscription = await this.typeInscriptionGateway.findById(
      input.id,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to update type inscription ${input.id} that does not exist`,
        `Tipo de inscrição não encontrado`,
        UpdateTypeInscriptionUsecase.name,
      );
    }

    const update = {
      description: input.description,
      value: input.value,
      specialtype: input.specialType,
    };

    typeInscription.update(update);

    await this.typeInscriptionGateway.update(typeInscription);

    const output: UpdateTypeInscriptionOutput = {
      id: typeInscription.getId(),
    };

    return output;
  }
}
