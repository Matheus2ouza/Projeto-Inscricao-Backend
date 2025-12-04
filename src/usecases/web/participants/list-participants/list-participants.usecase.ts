import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListParticipantsInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListParticipantsOutput = {
  account: Accounts;
  countAccounts: number;
  countParticipants: number;
  total: number;
  page: number;
  pageCount: number;
};

export type Accounts = {
  id: string;
  username: string;
  countParticipants: number;
  participants: Participants;
}[];

export type Participants = {
  id: string;
  name: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
}[];

@Injectable()
export class ListParticipantsUsecase
  implements Usecase<ListParticipantsInput, ListParticipantsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly userGateway: AccountGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  public async execute(
    input: ListParticipantsInput,
  ): Promise<ListParticipantsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(10, Math.floor(input.pageSize || 10)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        ListParticipantsUsecase.name,
      );
    }

    // Buscar contas (com paginação)
    const { accountIds, total } =
      await this.inscriptionGateway.findUniqueAccountIdsPaginatedByEventId(
        input.eventId,
        safePage,
        safePageSize,
      );

    if (accountIds.length === 0) {
      return {
        account: [],
        countAccounts: 0,
        countParticipants: 0,
        total: 0,
        page: safePage,
        pageCount: 0,
      };
    }

    // Buscar informações das contas
    const users = await this.userGateway.findByIds(accountIds);
    const userMap = new Map(users.map((u) => [u.getId(), u.getUsername()]));

    // Buscar todas as inscrições das contas
    const allInscriptions =
      await this.inscriptionGateway.findManyByEventAndAccountIds(
        input.eventId,
        accountIds,
      );

    const inscriptionIds = allInscriptions.map((i) => i.getId());

    // Buscar todos os participantes dessas inscrições
    const allParticipants =
      inscriptionIds.length > 0
        ? await this.participantGateway.findManyByInscriptionIds(inscriptionIds)
        : [];

    const typeIds = [
      ...new Set(allParticipants.map((p) => p.getTypeInscriptionId())),
    ];

    const allTypes =
      typeIds.length > 0
        ? await this.typeInscriptionGateway.findByIds(typeIds)
        : [];

    // Map: id -> description
    const typeMap = new Map(
      allTypes.map((t) => [t.getId(), t.getDescription()]),
    );

    const participantMap = new Map<string, Participants>();

    for (const p of allParticipants) {
      const entry = participantMap.get(p.getInscriptionId()) || [];

      entry.push({
        id: p.getId(),
        name: p.getName(),
        birthDate: p.getBirthDate(),
        typeInscription:
          typeMap.get(p.getTypeInscriptionId()) ?? 'Não informado',
        gender: p.getGender(),
      });

      participantMap.set(p.getInscriptionId(), entry);
    }

    // Organizar o resultado por conta
    const accountsData = accountIds.map((accountId) => {
      const username = userMap.get(accountId) ?? 'Usuário não identificado';

      const inscriptions = allInscriptions.filter(
        (ins) => ins.getAccountId() === accountId,
      );

      const participants = inscriptions.flatMap(
        (ins) => participantMap.get(ins.getId()) || [],
      );

      return {
        id: accountId,
        username,
        countParticipants: participants.length,
        participants,
      };
    });

    return {
      account: accountsData,
      countAccounts: total,
      countParticipants: event.getQuantityParticipants(),
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }
}
