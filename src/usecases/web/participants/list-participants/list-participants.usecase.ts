import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListParticipantsInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListParticipantsOutput = {
  accounts: Account[];
  countAccounts: number;
  countParticipants: number;
  countParticipantsMale: number;
  countParticipantsFemale: number;
  total: number;
  page: number;
  pageCount: number;
};

export type Account = {
  id: string;
  username: string;
  countParticipants: number;
  participants: Participants[];
};

export type Participants = {
  id: string;
  name: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
};

@Injectable()
export class ListParticipantsUsecase
  implements Usecase<ListParticipantsInput, ListParticipantsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly userGateway: AccountGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
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

    const [event, countParticipantsMale, countParticipantsFemale] =
      await Promise.all([
        this.eventGateway.findById(input.eventId),
        this.inscriptionGateway.countUniqueAccountIdsByEventIdAndGender(
          input.eventId,
          genderType.MASCULINO,
        ),
        this.inscriptionGateway.countUniqueAccountIdsByEventIdAndGender(
          input.eventId,
          genderType.FEMININO,
        ),
      ]);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        ListParticipantsUsecase.name,
      );
    }

    const countAccounts =
      await this.inscriptionGateway.countUniqueAccountIdsByEventId(
        input.eventId,
      );
    const pageCount = Math.ceil(countAccounts / safePageSize);

    if (countAccounts === 0) {
      return {
        accounts: [],
        countAccounts: 0,
        countParticipants: 0,
        countParticipantsMale: 0,
        countParticipantsFemale: 0,
        total: 0,
        page: safePage,
        pageCount: 0,
      };
    }

    /**
     * 1. Buscar accountIds paginados
     */
    const accountIds =
      await this.inscriptionGateway.findAccountIdsByEventIdPaginated(
        input.eventId,
        safePage,
        safePageSize,
      );

    /**
     * 2. Buscar contas
     */
    const accounts = await this.userGateway.findByIds(accountIds);

    /**
     * 3. Buscar participantes dessas contas no evento
     */
    const participantLinks =
      await this.accountParticipantInEventGateway.findByEventIdAndAccountIds(
        input.eventId,
        accountIds,
      );

    /**
     * 4. Buscar tipos de inscrição
     */
    const typeInscriptionIds = [
      ...new Set(participantLinks.map((p) => p.typeInscriptionId)),
    ];

    const typeInscriptions =
      await this.typeInscriptionGateway.findByIds(typeInscriptionIds);

    const typeInscriptionMap = new Map(
      typeInscriptions.map((t) => [t.getId(), t.getDescription()]),
    );

    /**
     * 5. Agrupar participantes por account
     */
    const participantsByAccount = new Map<string, Participants[]>();

    for (const p of participantLinks) {
      const list = participantsByAccount.get(p.accountId) ?? [];

      list.push({
        id: p.participantId,
        name: p.participantName,
        birthDate: p.participantBirthDate,
        gender: p.participantGender,
        typeInscription: typeInscriptionMap.get(p.typeInscriptionId) ?? 'N/A',
      });

      participantsByAccount.set(p.accountId, list);
    }

    /**
     * 6. Montar DTO final
     */
    const accountsOutput: Account[] = accounts.map((account) => {
      const participants = participantsByAccount.get(account.getId()) ?? [];

      return {
        id: account.getId(),
        username: account.getUsername(),
        countParticipants: participants.length,
        participants,
      };
    });

    return {
      accounts: accountsOutput,
      countAccounts,
      countParticipants: event.getQuantityParticipants(),
      countParticipantsMale,
      countParticipantsFemale,
      total: countAccounts,
      page: safePage,
      pageCount,
    };
  }
}
