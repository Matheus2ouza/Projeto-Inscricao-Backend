import { Injectable } from '@nestjs/common';
import { PaymentMode } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListAllPaymentsPendingInput = {
  eventId: string;
  localityId?: string;
  accountId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsPendingOutput = {
  inscriptions: Inscriptions[];
  allowedPaymentModes: PaymentMode[];
  total: number;
  page: number;
  pageCount: number;
};

type Inscriptions = {
  id: string;
  totalValue: number;
  totalPaid: number;
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
    private readonly localityGateway: LocalityGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentAllocation: PaymentAllocationGateway,
  ) {}

  async execute({
    eventId,
    localityId,
    accountId,
    page,
    pageSize,
  }: ListAllPaymentsPendingInput): Promise<ListAllPaymentsPendingOutput> {
    const safePage = Math.max(1, Math.floor(page || 1));
    const safePageSize = Math.max(5, Math.floor(pageSize || 5));

    const event = await this.eventGateway.findById(eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${eventId}`,
        `Evento não encontrado`,
        ListAllPaymentsPendingUsecase.name,
      );
    }

    const localityIds = await this.seachLocalitiesToUser(accountId, localityId);

    const [inscriptions, total] = await Promise.all([
      this.inscriptionGateway.findInscriptionsPending(
        safePage,
        safePageSize,
        event.getId(),
        {
          localityIds,
          status: 'PENDING',
        },
      ),

      this.inscriptionGateway.countTotal(event.getId(), localityIds),
    ]);

    const inscriptionsData = await Promise.all(
      inscriptions.map(async (i) => {
        const paidValue =
          await this.paymentAllocation.sumPaidValueByInscription(i.getId());

        const totalValue = i.getTotalValue();

        const canPay = paidValue < totalValue;

        return {
          id: i.getId(),
          totalValue: i.getTotalValue(),
          totalPaid: i.getTotalPaid(),
          status: i.getStatus(),
          createAt: i.getCreatedAt(),
          canPay,
        };
      }),
    );

    const output: ListAllPaymentsPendingOutput = {
      inscriptions: inscriptionsData,
      allowedPaymentModes: event.getAllowedPaymentModes(),
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }

  private async seachLocalitiesToUser(
    userId?: string,
    localityId?: string,
  ): Promise<string[]> {
    const localities = await this.localityGateway.findByAccountIdAndLocality(
      userId,
      localityId,
    );

    return localities.map((l) => l.getId());
  }
}
