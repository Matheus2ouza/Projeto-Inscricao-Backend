import { Injectable } from '@nestjs/common';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';
import { AccountParticipantNotFoundUsecaseException } from '../../exceptions/account-participant/account-participant-not-found.usecase.exception';

export type FindMemberByIdInput = {
  id: string;
};

export type FindMemberByIdOutput = {
  id: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  createdAt: string;
};

@Injectable()
export class FindMemberByIdUsecase
  implements Usecase<FindMemberByIdInput, FindMemberByIdOutput>
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
  ) {}

  async execute(input: FindMemberByIdInput): Promise<FindMemberByIdOutput> {
    const accountParticipant = await this.accountParticipantGateway.findById(
      input.id,
    );

    if (!accountParticipant) {
      throw new AccountParticipantNotFoundUsecaseException(
        `Attempt to find the member via ID: ${input.id}, but nothing was returned.`,
        `Nenhum membro foi encontrado.`,
        FindMemberByIdUsecase.name,
      );
    }

    return {
      id: accountParticipant.getId(),
      name: accountParticipant.getName(),
      preferredName: accountParticipant.getPreferredName(),
      cpf: accountParticipant.getCpf(),
      birthDate: accountParticipant.getBirthDate(),
      gender: accountParticipant.getGender(),
      shirtSize: accountParticipant.getShirtSize(),
      shirtType: accountParticipant.getShirtType(),
      createdAt: accountParticipant.getCreatedAt().toISOString(),
    };
  }
}
