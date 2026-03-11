import { Injectable } from '@nestjs/common';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant.entity';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';

export type CreateMembersInput = {
  accountId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type CreateMembersOutput = {
  id: string;
};

@Injectable()
export class CreateMembersUsecase
  implements Usecase<CreateMembersInput, CreateMembersOutput>
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
  ) {}

  async execute(input: CreateMembersInput): Promise<CreateMembersOutput> {
    const accountParticipant = AccountParticipant.create({
      accountId: input.accountId,
      name: input.name,
      preferredName: input.preferredName,
      cpf: input.cpf,
      birthDate: new Date(input.birthDate),
      gender: input.gender,
      shirtSize: input.shirtSize,
      shirtType: input.shirtType,
    });

    await this.accountParticipantGateway.create(accountParticipant);

    const output: CreateMembersOutput = {
      id: accountParticipant.getId(),
    };

    return output;
  }
}
