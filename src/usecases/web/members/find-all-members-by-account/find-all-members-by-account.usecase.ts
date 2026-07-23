import { Injectable } from '@nestjs/common';
import { ShirtSize, ShirtType, UF } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllMembersByAccountUsecaseInput = {
  accountId: string;
  eventId: string;
  localityId?: string;
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
  locality?: Locality;
}[];

type Locality = {
  id: string;
  name: string;
  uf: UF;
};

@Injectable()
export class FindAllMembersByAccountUsecase
  implements
    Usecase<
      FindAllMembersByAccountUsecaseInput,
      FindAllMembersByAccountUsecaseOutput
    >
{
  constructor(
    private readonly localityGateway: LocalityGateway,
    private readonly eventGateway: EventGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
  ) {}

  async execute(
    input: FindAllMembersByAccountUsecaseInput,
  ): Promise<FindAllMembersByAccountUsecaseOutput> {
    const [event, localities] = await Promise.all([
      this.eventGateway.findById(input.eventId),
      this.localityGateway.findByAccountIdAndLocality(
        input.accountId,
        input.localityId,
      ),
    ]);

    if (!event) {
      return [];
    }

    const localityIds = localities.map((l) => l.getId());

    if (localityIds.length === 0) {
      return [];
    }

    const localitiesById = new Map(
      localities.map((locality) => [locality.getId(), locality]),
    );

    const membersArray =
      await this.accountParticipantGateway.findAllByLocalityIds(localityIds);

    if (membersArray.length === 0) {
      return [];
    }

    const membersIds = membersArray.map((m) => m.getId());

    const alreadyRegistered =
      await this.accountParticipantInEventGateway.findByIds(
        membersIds,
        event.getId(),
      );

    const registeredIds = new Set(
      alreadyRegistered.map((r) => r.getAccountParticipantId()),
    );

    return membersArray.map((member) => {
      const locality = localitiesById.get(member.getLocalityId());

      return {
        id: member.getId(),
        name: member.getName(),
        cpf: member.getCpf(),
        preferredName: member.getPreferredName(),
        birthDate: member.getBirthDate(),
        gender: member.getGender(),
        shirtSize: member.getShirtSize(),
        shirtType: member.getShirtType(),
        registered: registeredIds.has(member.getId()),
        locality: locality
          ? {
              id: locality.getId(),
              name: locality.getName(),
              uf: locality.getUf(),
            }
          : undefined,
      };
    });
  }
}
