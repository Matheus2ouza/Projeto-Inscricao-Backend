import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';
import { InvalidTypeInscriptionUsecaseException } from '../../exceptions/participants/invalid-type-inscription.usecase.exception';
import { ParticipantNotFoundUsecaseException } from '../../exceptions/participants/participant-not-found.usecase.exception';

export type UpdateParticipantsInput = {
  participantId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  typeInscriptionId: string;
};

export type UpdateParticipantsOutput = {
  id: string;
};

@Injectable()
export class UpdateParticipantsUsecase
  implements Usecase<UpdateParticipantsInput, UpdateParticipantsOutput>
{
  constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: UpdateParticipantsInput,
  ): Promise<UpdateParticipantsOutput> {
    const participant = await this.participantGateway.findById(
      input.participantId,
    );

    if (!participant) {
      throw new ParticipantNotFoundUsecaseException(
        `attempt to update participant ${input.participantId} that does not exist`,
        `Participante não encontrado`,
        UpdateParticipantsUsecase.name,
      );
    }

    // Buscar inscrição para atualizar total
    const inscription = await this.inscriptionGateway.findById(
      participant.getInscriptionId(),
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to update participant ${input.participantId} but inscription ${participant.getInscriptionId()} was not found`,
        `Inscrição não encontrada`,
        UpdateParticipantsUsecase.name,
      );
    }

    // Buscar tipo anterior
    const oldType = await this.typeInscriptionGateway.findById(
      participant.getTypeInscriptionId(),
    );

    // Buscar tipo novo
    const newType = await this.typeInscriptionGateway.findById(
      input.typeInscriptionId,
    );

    if (!oldType || !newType) {
      const missingType = !oldType
        ? participant.getTypeInscriptionId()
        : input.typeInscriptionId;
      throw new InvalidTypeInscriptionUsecaseException(
        `attempt to update participant ${input.participantId} with invalid type inscription: ${missingType}`,
        `Tipo de inscrição inválido`,
        UpdateParticipantsUsecase.name,
      );
    }

    const diff = Number(newType.getValue()) - Number(oldType.getValue());

    participant.update({
      name: input.name,
      birthDate: input.birthDate,
      gender: input.gender,
      typeInscriptionId: input.typeInscriptionId,
    });

    // Atualize o Participante
    const updatedParticipant =
      await this.participantGateway.update(participant);

    if (newType.getSpecialType()) {
      await this.inscriptionGateway.updateStatus(
        inscription.getId(),
        'UNDER_REVIEW',
      );
    }

    // Atualiza valor total da inscrição
    const newTotal = inscription.getTotalValue() + diff;
    await this.inscriptionGateway.updateValue(inscription.getId(), newTotal);

    const output: UpdateParticipantsOutput = {
      id: updatedParticipant.getId(),
    };

    return output;
  }
}
