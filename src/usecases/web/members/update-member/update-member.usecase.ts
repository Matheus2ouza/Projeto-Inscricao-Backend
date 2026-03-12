import { Injectable } from '@nestjs/common';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';
import { AccountParticipantNotFoundUsecaseException } from '../../exceptions/account-participant/account-participant-not-found.usecase.exception';

export type UpdateMemberInput = {
  id: string;
  name?: string;
  preferredName?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type UpdateMemberOutput = {
  id: string;
};

@Injectable()
export class UpdateMemberUsecase
  implements Usecase<UpdateMemberInput, UpdateMemberOutput>
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
  ) {}

  async execute(input: UpdateMemberInput): Promise<UpdateMemberOutput> {
    const accountParticipant = await this.accountParticipantGateway.findById(
      input.id,
    );

    if (!accountParticipant) {
      throw new AccountParticipantNotFoundUsecaseException(
        `Attempt to update member with id ${input.id} but it was not found`,
        `Nenhum membro foi encontrado para ser atualizado`,
        UpdateMemberUsecase.name,
      );
    }

    accountParticipant.update({
      name: input.name,
      preferredName: input.preferredName,
      cpf: input.cpf,
      birthDate: input.birthDate,
      gender: input.gender,
      shirtSize: input.shirtSize,
      shirtType: input.shirtType,
    });
    await this.accountParticipantGateway.update(accountParticipant);
    return {
      id: accountParticipant.getId(),
    };
  }
}
