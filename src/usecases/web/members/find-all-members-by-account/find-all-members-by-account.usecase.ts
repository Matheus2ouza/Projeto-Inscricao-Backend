import { Injectable } from '@nestjs/common';
import { ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllMembersByAccountUsecaseInput = {
  eventId: string;
  accountId: string;
};

export type FindAllMembersByAccountUsecaseOutput = {
  id: string;
  name: string;
  cpf?: string;
  preferredName?: string;
  birthDate: Date;
  gender: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
}[];

@Injectable()
export class FindAllMembersByAccountUsecase
  implements
    Usecase<
      FindAllMembersByAccountUsecaseInput,
      FindAllMembersByAccountUsecaseOutput
    >
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
  ) {}

  async execute(
    input: FindAllMembersByAccountUsecaseInput,
  ): Promise<FindAllMembersByAccountUsecaseOutput> {
    const accountParticipant =
      await this.accountParticipantGateway.findAllByAccountId(
        input.accountId,
        input.eventId,
      );

    const output: FindAllMembersByAccountUsecaseOutput = accountParticipant.map(
      (accountParticipant) => ({
        id: accountParticipant.getId(),
        name: accountParticipant.getName(),
        cpf: accountParticipant.getCpf(),
        preferredName: accountParticipant.getPreferredName(),
        birthDate: accountParticipant.getBirthDate(),
        gender: accountParticipant.getGender(),
        shirtSize: accountParticipant.getShirtSize(),
        shirtType: accountParticipant.getShirtType(),
      }),
    );

    return output;
  }
}
