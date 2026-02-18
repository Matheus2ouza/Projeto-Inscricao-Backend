import { Injectable } from '@nestjs/common';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Usecase } from 'src/usecases/usecase';
import { ParticipantNotFoundUsecaseException } from '../../exceptions/participants/participant-not-found.usecase.exception';

export type UpdateParticipantsInput = {
  id: string;
  name?: string;
  birthDate?: Date;
  gender?: genderType;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type UpdateParticipantsOutput = {
  id: string;
};

@Injectable()
export class UpdateParticipantsUsecase
  implements Usecase<UpdateParticipantsInput, UpdateParticipantsOutput>
{
  constructor(private readonly participantGateway: ParticipantGateway) {}

  async execute(
    input: UpdateParticipantsInput,
  ): Promise<UpdateParticipantsOutput> {
    const participant = await this.participantGateway.findById(input.id);

    if (!participant) {
      throw new ParticipantNotFoundUsecaseException(
        `attempt to update participant ${input.id} that does not exist`,
        `Participante não encontrado`,
        UpdateParticipantsUsecase.name,
      );
    }

    participant.update({
      name: input.name,
      birthDate: input.birthDate,
      gender: input.gender,
      preferredName: input.preferredName,
      shirtSize: input.shirtSize,
      shirtType: input.shirtType,
    });

    const updatedParticipant =
      await this.participantGateway.update(participant);

    return {
      id: updatedParticipant.getId(),
    };
  }
}
