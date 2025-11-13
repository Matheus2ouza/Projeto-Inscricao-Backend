import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type UpdateInscriptionInput = {
  id: string;
  responsible: string;
  phone: string;
  email: string;
};

export type UpdateInscriptionOutput = {
  id: string;
};

@Injectable()
export class UpdateInscriptionUsecase
  implements Usecase<UpdateInscriptionInput, UpdateInscriptionOutput>
{
  public constructor(private readonly inscriptionGateway: InscriptionGateway) {}

  public async execute(
    input: UpdateInscriptionInput,
  ): Promise<UpdateInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(input.id);

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `No registrations found with the inscriptionId: ${input.id} in ${UpdateInscriptionUsecase.name}`,
        `Inscrição não encontrada`,
        UpdateInscriptionUsecase.name,
      );
    }

    inscription.update({
      responsible: input.responsible,
      phone: input.phone,
      email: input.email,
    });

    await this.inscriptionGateway.update(inscription);

    const output: UpdateInscriptionOutput = {
      id: inscription.getId(),
    };

    return output;
  }
}
