import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListParticipantsInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListParticipantsOutput = {
  account: Accounts;
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
  birthDate: string;
  gender: string;
}[];

@Injectable()
export class ListParticipantsUsecase
  implements Usecase<ListParticipantsInput, ListParticipantsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly userGateway: UserGateway,
    private readonly participantGateway: ParticipantGateway,
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
        `Event not found with finding event with id ${input.eventId} in ${ListParticipantsUsecase.name}`,
        `Evento não encontrado`,
        ListParticipantsUsecase.name,
      );
    }

    // 1. Buscar contas que têm inscrições no evento (com paginação)
    const { accountIds: paginatedAccountIds, total } =
      await this.inscriptionGateway.findUniqueAccountIdsPaginatedByEventId(
        input.eventId,
        safePage,
        safePageSize,
      );

    if (!paginatedAccountIds.length) {
      return {
        account: [],
        total: 0,
        page: safePage,
        pageCount: 0,
      };
    }

    // Buscar informações das contas (usernames)
    const users = await this.userGateway.findByIds(paginatedAccountIds);
    const userMap = new Map(
      users.map((user) => [user.getId(), user.getUsername()]),
    );

    const pageCount = Math.ceil(total / safePageSize);

    // 2. Para cada conta paginada, buscar suas inscrições e participantes
    const accountsData = await Promise.all(
      paginatedAccountIds.map(async (accountId) => {
        const username = userMap.get(accountId) || 'Usuário não identificado';

        // 2.1. Buscar todas as inscrições dessa conta no evento
        const accountInscriptions =
          await this.inscriptionGateway.findByEventIdAndAccountId(
            input.eventId,
            accountId,
          );

        // 2.2. Para cada inscrição, buscar participantes
        const allParticipants: Participants = [];
        for (const inscription of accountInscriptions) {
          const participants =
            await this.participantGateway.findByInscriptionId(
              inscription.getId(),
            );

          // Converter participantes para o formato de saída
          const formattedParticipants: Participants = participants.map((p) => ({
            id: p.getId(),
            name: p.getName(),
            birthDate: p.getBirthDate().toISOString(),
            gender: p.getGender(),
          }));

          allParticipants.push(...formattedParticipants);
        }

        // Listar todos os participantes da conta
        const countParticipants = allParticipants.length;

        return {
          id: accountId,
          username,
          countParticipants,
          participants: allParticipants,
        };
      }),
    );

    return {
      account: accountsData,
      total,
      page: safePage,
      pageCount,
    };
  }
}
