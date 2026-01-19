import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ListAllPaymentsInput = {
  eventId: string;
  accountId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsOutput = {
  summary: PaymentsSummary;
  payments: Payment[];
  total: number;
  page: number;
  pageCount: number;
};

export type PaymentsSummary = {
  totalPayments: number;
  totalPaidValue: number;
  totalUnderReviewValue: number;
  totalRefusedValue: number;
};

type Payment = {
  id: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  imageUrl: string;
  rejectionReason?: string;
  allocation?: PaymentAllocation[];
};

type PaymentAllocation = {
  value: number;
  inscriptionId: string;
};

@Injectable()
export class ListAllPaymentsUseCase
  implements Usecase<ListAllPaymentsInput, ListAllPaymentsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: ListAllPaymentsInput,
  ): Promise<ListAllPaymentsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found when searching with eventId: ${input.eventId} in ${ListAllPaymentsUseCase.name}`,
        `Evento não encontrado ou invalido`,
        ListAllPaymentsUseCase.name,
      );
    }

    const [summary, payments, total] = await Promise.all([
      this.paymentGateway.countAllOrdered(input.accountId, input.eventId),
      this.paymentGateway.findAllPaginated(
        input.accountId,
        input.eventId,
        safePage,
        safePageSize,
      ),
      this.paymentGateway.countAllFiltered(input.accountId, input.eventId),
    ]);

    const paymentsPaginated = await Promise.all(
      payments.map(async (p) => {
        const PaymentAllocation =
          await this.paymentAllocationGateway.findByPaymentId(p.getId());

        const imagePath = await this.getPublicUrlOrEmpty(p.getImageUrl());

        const allocation = PaymentAllocation?.map((a) => ({
          value: a.getValue(),
          inscriptionId: a.getInscriptionId(),
        }));

        return {
          id: p.getId(),
          status: p.getStatus(),
          totalValue: p.getTotalValue(),
          createdAt: p.getCreatedAt(),
          imageUrl: imagePath,
          rejectionReason: p.getRejectionReason(),
          allocation: allocation,
        };
      }),
    );

    const output: ListAllPaymentsOutput = {
      summary,
      payments: paymentsPaginated,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }
}
