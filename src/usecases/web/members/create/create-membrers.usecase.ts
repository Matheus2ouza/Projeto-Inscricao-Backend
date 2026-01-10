import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant.entity';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';

export type CreateMembersInput = {
  accountId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
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
      birthDate: new Date(input.birthDate),
      gender: input.gender,
    });

    await this.accountParticipantGateway.create(accountParticipant);

    const output: CreateMembersOutput = {
      id: accountParticipant.getId(),
    };

    return output;
  }
}
