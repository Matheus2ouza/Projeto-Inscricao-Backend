import { Injectable, Logger } from '@nestjs/common';
import { Locality } from 'src/domain/entities/locality/locality.entity';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type UpdateInscriptionInput = {
  id: string;
  localityId?: string;
  name?: string;
  phone?: string;
  email?: string;
  observation?: string;
};

export type UpdateInscriptionOutput = {
  id: string;
};

@Injectable()
export class UpdateInscriptionUsecase
  implements Usecase<UpdateInscriptionInput, UpdateInscriptionOutput>
{
  private readonly logger = new Logger(UpdateInscriptionUsecase.name);

  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly localityGateway: LocalityGateway,
  ) {}

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

    let localityValid: Locality | null = null;
    const newLocality = input.localityId;

    // verifica se foi passado uma nova localidade
    if (newLocality != undefined) {
      const locality = await this.localityGateway.findById(newLocality);

      // validade se encontrou alguma localidade
      // se encontrou então passa ela para ser atualizada no entidade
      if (locality) localityValid = locality;

      // se não dispara um log warn
      if (!locality)
        this.logger.warn(
          `Tentativa de trocar de localidade mas a nova localidade: ${newLocality} não corresponde a nenhuma localidade conhecida`,
        );
    }

    inscription.update({
      // atualiza a localidade
      localityId: localityValid != null ? localityValid.getId() : undefined,

      // atualiza os dados da inscrição
      responsible: input.name,
      phone: input.phone,
      email: input.email,
      observation: input.observation,

      // se a inscrição for guest então atualiza tambem os dados guest
      guestEmail: inscription.getIsGuest() ? input.email : undefined,
      guestName: inscription.getIsGuest() ? input.name : undefined,
    });

    await this.inscriptionGateway.update(inscription);

    const output: UpdateInscriptionOutput = {
      id: inscription.getId(),
    };

    return output;
  }
}
