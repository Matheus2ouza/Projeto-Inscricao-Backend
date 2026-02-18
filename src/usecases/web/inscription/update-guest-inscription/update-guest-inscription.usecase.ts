import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';

export type UpdateGuestInscriptionInput = {
  id: string;
  guestName?: string;
  guestEmail?: string;
  guestLocality?: string;
  phone?: string;
};

export type UpdateGuestInscriptionOutput = {
  id: string;
};

@Injectable()
export class UpdateGuestInscriptionUsecase
  implements Usecase<UpdateGuestInscriptionInput, UpdateGuestInscriptionOutput>
{
  constructor(private readonly inscriptionGateway: InscriptionGateway) {}

  async execute(
    input: UpdateGuestInscriptionInput,
  ): Promise<UpdateGuestInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(input.id);

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `No registrations found with the inscriptionId: ${input.id} in ${UpdateGuestInscriptionUsecase.name}`,
        `Inscrição não encontrada`,
        UpdateGuestInscriptionUsecase.name,
      );
    }

    // Atualiza os dados da inscrição Guest
    inscription.update({
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestLocality: input.guestLocality,
      phone: input.phone,
      responsible: input.guestName,
      email: input.guestEmail,
    });

    await this.inscriptionGateway.update(inscription);

    const output: UpdateGuestInscriptionOutput = {
      id: inscription.getId(),
    };
    return output;
  }
}
