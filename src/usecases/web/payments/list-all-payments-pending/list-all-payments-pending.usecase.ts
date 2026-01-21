import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListAllPaymentsPendingInput = {
  accountId: string;
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsPendingOutput = {
  inscriptions: Inscriptions[];
  allowCard: boolean;
  total: number;
  page: number;
  pageCount: number;
};

type Inscriptions = {
  id: string;
  eventId: string;
  accountId: string;
  totalValue: number;
  status: string;
  createAt: Date;
  canPay: boolean;
};

@Injectable()
export class ListAllPaymentsPendingUsecase
  implements Usecase<ListAllPaymentsPendingInput, ListAllPaymentsPendingOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentAllocation: PaymentAllocationGateway,
  ) {}

  async execute(
    input: ListAllPaymentsPendingInput,
  ): Promise<ListAllPaymentsPendingOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(5, Math.floor(input.pageSize || 5));

    const event = await this.eventGateway.findById(input.eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        ListAllPaymentsPendingUsecase.name,
      );
    }

    const [inscriptions, total] = await Promise.all([
      this.inscriptionGateway.findInscriptionsPending(
        safePage,
        safePageSize,
        event.getId(),
        input.accountId,
        {
          status: 'PENDING',
        },
      ),

      this.inscriptionGateway.countTotal(event.getId(), input.accountId, {
        status: 'PENDING',
      }),
    ]);

    const inscriptionsData = await Promise.all(
      inscriptions.map(async (i) => {
        const paidValue =
          await this.paymentAllocation.sumPaidValueByInscription(i.getId());

        const totalValue = i.getTotalValue();

        const canPay = paidValue < totalValue;

        return {
          id: i.getId(),
          eventId: i.getEventId(),
          accountId: i.getAccountId(),
          totalValue: i.getTotalValue(),
          status: i.getStatus(),
          createAt: i.getCreatedAt(),
          canPay,
        };
      }),
    );

    const output: ListAllPaymentsPendingOutput = {
      inscriptions: inscriptionsData,
      allowCard: event.getAllowCard() || false,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }
}
