import { Injectable, Logger } from '@nestjs/common';
import { Locality } from 'src/domain/entities/locality/locality.entity';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';

export type UpdateGuestInscriptionInput = {
  id: string;
  localityId?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type UpdateGuestInscriptionOutput = {
  id: string;
};

@Injectable()
export class UpdateGuestInscriptionUsecase
  implements Usecase<UpdateGuestInscriptionInput, UpdateGuestInscriptionOutput>
{
  private readonly logger = new Logger(UpdateGuestInscriptionUsecase.name);
  constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly localityGateway: LocalityGateway,
  ) {}

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

    let localityValid: Locality | null = null;
    const newLocality = input.localityId;

    if (newLocality != undefined) {
      const locality = await this.localityGateway.findById(newLocality);

      if (locality) localityValid = locality;

      if (!locality)
        this.logger.warn(
          `Tentativa de trocar de localidade mas a nova localidade: ${newLocality} não corresponde a nenhuma localidade conhecida`,
        );
    }

    // Atualiza os dados da inscrição Guest
    inscription.update({
      localityId: localityValid != null ? localityValid.getId() : undefined,
      guestName: input.name,
      responsible: input.name,
      email: input.email,
      guestEmail: input.email,
      phone: input.phone,
    });

    await this.inscriptionGateway.update(inscription);

    const output: UpdateGuestInscriptionOutput = {
      id: inscription.getId(),
    };
    return output;
  }
}
