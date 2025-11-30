import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ListPaymentToAnalysisInput = {
  eventId: string;
};

export type ListPaymentToAnalysisOutput = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      id: string;
      responsible: string;
      totalValue: number;
      countPayments: number;
    }[];
  }[];
};

@Injectable()
export class ListPaymentToAnalysisUsecase
  implements Usecase<ListPaymentToAnalysisInput, ListPaymentToAnalysisOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly userGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  async execute(
    input: ListPaymentToAnalysisInput,
  ): Promise<ListPaymentToAnalysisOutput> {
    const eventExists = await this.eventGateway.findById(input.eventId);

    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        ListPaymentToAnalysisUsecase.name,
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
          id: string;
          responsible: string;
          totalValue: number;
          countPayments: number;
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
        // Buscar pagamentos para esta inscrição
        const payments =
          await this.paymentInscriptionGateway.findbyInscriptionId(
            inscription.getId(),
          );

        accountData.inscriptions.push({
          id: inscription.getId(),
          responsible: inscription.getResponsible(),
          totalValue: inscription.getTotalValue(),
          countPayments: payments ? payments.length : 0,
        });
      }
    }

    return {
      account: Array.from(accountsMap.values()),
    };
  }
}
