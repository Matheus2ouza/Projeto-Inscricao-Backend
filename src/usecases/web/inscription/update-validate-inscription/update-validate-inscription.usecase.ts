import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';

export type UpdateValidateInscriptionInput = {
  inscriptionId: string;
  expiresAt: Date;
};

export type UpdateValidateInscriptionOutput = {
  id: string;
  expiresAt?: Date;
};

@Injectable()
export class UpdateValidateInscriptionUsecase
  implements
    Usecase<UpdateValidateInscriptionInput, UpdateValidateInscriptionOutput>
{
  constructor(private readonly inscriptionGateway: InscriptionGateway) {}

  async execute(
    input: UpdateValidateInscriptionInput,
  ): Promise<UpdateValidateInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `User not found with finding user with id ${input.inscriptionId}`,
        `Inscrição não encontrada`,
        UpdateValidateInscriptionUsecase.name,
      );
    }

    // Se a inscrição estiver expirada ou cancelada, remove o expiração
    if (
      inscription.getStatus() === InscriptionStatus.EXPIRED ||
      inscription.getStatus() === InscriptionStatus.CANCELLED
    ) {
      inscription.removeExpires();
    }

    // Seta a nova data de expiração
    inscription.setExpiresAt(input.expiresAt);
    await this.inscriptionGateway.update(inscription);

    const output: UpdateValidateInscriptionOutput = {
      id: inscription.getId(),
      expiresAt: inscription.getExpiresAt(),
    };

    return output;
  }
}
