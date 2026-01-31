import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type FindAccountWithInscriptionsInput = {
  eventId: string;
};

export type FindAccountWithInscriptionsOutput = {
  accounts: AccountWithInscriptions[];
};

export type Inscriptions = {
  id: string;
  name: string;
  createAt: Date;
  countParticipants: number;
}[];

export type AccountWithInscriptions = {
  id: string;
  username: string;
  countInscriptons: number;
  inscriptions: Inscriptions;
};

@Injectable()
export class FindAccountWithInscriptionsUsecase
  implements
    Usecase<FindAccountWithInscriptionsInput, FindAccountWithInscriptionsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly userGateway: AccountGateway,
  ) {}

  public async execute(
    input: FindAccountWithInscriptionsInput,
  ): Promise<FindAccountWithInscriptionsOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found when searching with eventId: ${input.eventId} in ${FindAccountWithInscriptionsUsecase.name}`,
        `Evento não encontrado ou invalido`,
        FindAccountWithInscriptionsUsecase.name,
      );
    }

    const inscriptions = await this.inscriptionGateway.findMany(input.eventId);

    if (!inscriptions.length) {
      return { accounts: [] };
    }

    const accountMap = new Map<string, Inscriptions>();

    await Promise.all(
      inscriptions.map(async (inscription) => {
        const accountId = inscription.getAccountId();
        if (!accountId) return;

        const countParticipants =
          await this.participantGateway.countByInscriptionId(
            inscription.getId(),
          );

        const formattedInscription = {
          id: inscription.getId(),
          name: inscription.getResponsible(),
          createAt: inscription.getCreatedAt(),
          countParticipants,
        };

        const accountInscriptions = accountMap.get(accountId) ?? [];

        accountInscriptions.push(formattedInscription);

        accountMap.set(accountId, accountInscriptions);
      }),
    );

    const accounts = await Promise.all(
      Array.from(accountMap.entries()).map(
        async ([accountId, accountInscriptions]) => {
          const user = await this.userGateway.findById(accountId);
          const sortedInscriptions = accountInscriptions.sort(
            (a, b) => b.createAt.getTime() - a.createAt.getTime(),
          );

          return {
            id: accountId,
            username: user?.getUsername() ?? 'Usuário não identificado',
            countInscriptons: sortedInscriptions.length,
            inscriptions: sortedInscriptions,
          };
        },
      ),
    );

    const orderedAccounts = accounts.sort((a, b) =>
      a.username.localeCompare(b.username),
    );

    return { accounts: orderedAccounts };
  }
}
