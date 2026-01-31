import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type AnalysisPaymentsPendingInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type AnalysisPaymentsPendingOutput = {
  event: Event;
  payments: Payment[];
  total: number;
  page: number;
  pageCount: number;
};

export type Event = {
  id: string;
  name: string;
  imageUrl: string;
  paymentEnabled: boolean;
  totalPaymentInAnalysis: number;
  totalAmountInAnalysis: number;
};

export type Payment = {
  id: string;
  responsible?: string;
  status: string;
  value: number;
  createdAt: Date;
};

@Injectable()
export class AnalysisPaymentsPendingUsecase
  implements
    Usecase<AnalysisPaymentsPendingInput, AnalysisPaymentsPendingOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly accountGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: AnalysisPaymentsPendingInput,
  ): Promise<AnalysisPaymentsPendingOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.min(15, Math.floor(input.pageSize || 15));

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found`,
        `Evento não encontrado`,
        AnalysisPaymentsPendingUsecase.name,
      );
    }

    const [payments, total, totalPaymentInAnalysis, totalAmountInAnalysis] =
      await Promise.all([
        this.paymentGateway.findAllPaginated(
          event.getId(),
          safePage,
          safePageSize,
          {
            status: [StatusPayment.UNDER_REVIEW],
          },
        ),
        this.paymentGateway.countAllFiltered(event.getId(), {
          status: [StatusPayment.UNDER_REVIEW],
        }),
        this.paymentGateway.countAllInAnalysis(event.getId()),
        this.paymentGateway.countTotalAmountInAnalysis(event.getId()),
      ]);

    const imagePath = await this.getPublicUrlOrEmpty(event.getImageUrl());

    const eventData: Event = {
      id: event.getId(),
      name: event.getName(),
      imageUrl: imagePath,
      paymentEnabled: event.getPaymentEnabled(),
      totalPaymentInAnalysis,
      totalAmountInAnalysis,
    };

    const paymentData = await Promise.all(
      payments.map(async (p) => {
        const accountId = p.getAccountId();
        if (!accountId) {
          return {
            id: p.getId(),
            responsible: 'Usuário não encontrado',
            status: p.getStatus(),
            value: p.getTotalValue(),
            createdAt: p.getCreatedAt(),
          };
        }

        const account = await this.accountGateway.findById(accountId);
        return {
          id: p.getId(),
          responsible: account?.getUsername() || 'Usuário não encontrado',
          status: p.getStatus(),
          value: p.getTotalValue(),
          createdAt: p.getCreatedAt(),
        };
      }),
    );

    const output: AnalysisPaymentsPendingOutput = {
      event: eventData,
      payments: paymentData,
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
