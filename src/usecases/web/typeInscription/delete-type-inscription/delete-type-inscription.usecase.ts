import { Injectable } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';

export type DeletetypeInscriptionInput = {
  id: string;
};

@Injectable()
export class DeletetypeInscriptionUsecase
  implements Usecase<DeletetypeInscriptionInput, void>
{
  constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(input: DeletetypeInscriptionInput): Promise<void> {
    const typeInscription = await this.typeInscriptionGateway.findById(
      input.id,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `Attempted to delete a registration type but none with the id were found: ${input.id}`,
        `Nenhum tipo de Inscrição encontrado`,
        DeletetypeInscriptionUsecase.name,
      );
    }

    await this.typeInscriptionGateway.delete(typeInscription.getId());
  }
}
