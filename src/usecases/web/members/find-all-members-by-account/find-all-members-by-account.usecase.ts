import { Injectable } from '@nestjs/common';
import { ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { Usecase } from 'src/usecases/usecase';
import { AccountNotFoundUsecaseException } from '../../exceptions/accounts/account-not-found.usecase.exception';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

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
  registered: boolean;
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
    private readonly accountGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly regionGateway: RegionGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
  ) {}

  async execute(
    input: FindAllMembersByAccountUsecaseInput,
  ): Promise<FindAllMembersByAccountUsecaseOutput> {
    const account = await this.accountGateway.findById(input.accountId);

    if (!account) {
      throw new AccountNotFoundUsecaseException(
        `Attempt to search for members, but was unable to find the admin account, ID: ${input.accountId}`,
        `Nenhuma conta encontrada para buscar os membros`,
        FindAllMembersByAccountUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to search for members, but the related event could not be found: ID: ${input.eventId}`,
        'Nenhum evento encontrado para buscar os membros',
        FindAllMembersByAccountUsecase.name,
      );
    }

    const membersArray =
      await this.accountParticipantGateway.findAllByAccountId(account.getId());

    const membersIds = membersArray.map((m) => m.getId());

    const alreadyRegistered =
      await this.accountParticipantInEventGateway.findByIds(
        membersIds,
        input.eventId,
      );

    const registeredIds = new Set(
      alreadyRegistered.map((r) => r.getAccountParticipantId()),
    );

    const output = membersArray.map((member) => ({
      id: member.getId(),
      name: member.getName(),
      cpf: member.getCpf(),
      preferredName: member.getPreferredName(),
      birthDate: member.getBirthDate(),
      gender: member.getGender(),
      shirtSize: member.getShirtSize(),
      shirtType: member.getShirtType(),
      registered: registeredIds.has(member.getId()),
    }));

    return output;
  }
}
