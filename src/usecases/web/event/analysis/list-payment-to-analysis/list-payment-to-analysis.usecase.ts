import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ListPaymentToAnalysisInput = {
  page?: number;
  pageSize?: number;
  eventId: string;
};

export type ListPaymentToAnalysisOutput = {
  inscriptions: Inscriptions[];
  total: number;
  page: number;
  pageCount: number;
};

type Inscriptions = {
  id: string;
  accountName?: string;
  responsible: string;
  totalValue: number;
  countPayments: number;
  payments: Payments[];
};

type Payments = {
  id: string;
  value: number;
  date: Date;
};

@Injectable()
export class ListPaymentToAnalysisUsecase
  implements Usecase<ListPaymentToAnalysisInput, ListPaymentToAnalysisOutput>
{
  constructor(
    private readonly accountGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  async execute(
    input: ListPaymentToAnalysisInput,
  ): Promise<ListPaymentToAnalysisOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(25, Math.floor(input.pageSize || 10)),
    );

    const event = await this.eventGateway.findById(input.eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        ListPaymentToAnalysisUsecase.name,
      );
    }

    const [inscriptions, total] = await Promise.all([
      this.inscriptionGateway.findInscriptionsWithPayments(
        safePage,
        safePageSize,
        event.getId(),
      ),
      this.inscriptionGateway.countInscriptionsWithPayments(event.getId()),
    ]);

    const enriched = await Promise.all(
      inscriptions.map(async (inscription) => {
        const payments =
          await this.paymentInscriptionGateway.findbyInscriptionId(
            inscription.getId(),
          );

        const paymentDtos = payments.map<Payments>((payment) => ({
          id: payment.getId(),
          value: Number(payment.getValue()),
          date: payment.getCreatedAt(),
        }));

        const account = await this.accountGateway.findById(
          inscription.getAccountId(),
        );

        return {
          id: inscription.getId(),
          accountName: account?.getUsername(),
          responsible: inscription.getResponsible(),
          totalValue: Number(inscription.getTotalValue()),
          countPayments: paymentDtos.length,
          payments: paymentDtos,
        };
      }),
    );

    const output: ListPaymentToAnalysisOutput = {
      inscriptions: enriched,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }
}
