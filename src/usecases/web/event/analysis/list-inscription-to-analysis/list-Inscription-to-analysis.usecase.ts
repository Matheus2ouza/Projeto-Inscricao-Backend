import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ListInscriptionToAnalysisInput = {
  eventId: string;
};

export type ListInscriptionToAnalysisOutput = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      id: string;
      responsible: string;
      phone: string;
      totalValue: number;
      status: string;
    }[];
  }[];
};

@Injectable()
export class ListInscriptionToAnalysisUsecase
  implements
    Usecase<ListInscriptionToAnalysisInput, ListInscriptionToAnalysisOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly userGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(
    input: ListInscriptionToAnalysisInput,
  ): Promise<ListInscriptionToAnalysisOutput> {
    const eventExists = await this.eventGateway.findById(input.eventId);

    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        ListInscriptionToAnalysisUsecase.name,
      );
    }

    const inscriptions = await this.inscriptionGateway.findByEventId({
      eventId: eventExists.getId(),
      status: ['UNDER_REVIEW'],
    });

    // Organizar inscrições por conta
    const accountsMap = new Map<
      string,
      {
        id: string;
        username: string;
        inscriptions: {
          id: string;
          responsible: string;
          phone: string;
          totalValue: number;
          status: string;
        }[];
      }
    >();

    for (const inscription of inscriptions) {
      const accountId = inscription.getAccountId();

      if (!accountsMap.has(accountId)) {
        // Buscar dados da conta usando o método existente
        const account = await this.userGateway.findById(accountId);
        if (account) {
          accountsMap.set(accountId, {
            id: account.getId(),
            username: account.getUsername(),
            inscriptions: [],
          });
        }
      }

      const accountData = accountsMap.get(accountId);
      if (accountData) {
        accountData.inscriptions.push({
          id: inscription.getId(),
          responsible: inscription.getResponsible(),
          phone: inscription.getPhone(),
          totalValue: Number(inscription.getTotalValue()),
          status: inscription.getStatus(),
        });
      }
    }

    return {
      account: Array.from(accountsMap.values()),
    };
  }
}
