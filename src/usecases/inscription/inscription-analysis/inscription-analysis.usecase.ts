import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type InscriptionAnalysisInput = {
  eventId: string;
};

export type InscriptionAnalysisOutput = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      responsible: string;
      phone: string;
      totalValue: number;
      status: string;
    }[];
  }[];
};

@Injectable()
export class InscriptionAnalysisUsecase
  implements Usecase<InscriptionAnalysisInput, InscriptionAnalysisOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly userGateway: UserGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(
    input: InscriptionAnalysisInput,
  ): Promise<InscriptionAnalysisOutput> {
    const eventExists = await this.eventGateway.findById(input.eventId);

    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        InscriptionAnalysisUsecase.name,
      );
    }

    const inscriptions = await this.inscriptionGateway.findByEventId(
      eventExists.getId(),
    );

    // Organizar inscrições por conta
    const accountsMap = new Map<
      string,
      {
        id: string;
        username: string;
        inscriptions: {
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
