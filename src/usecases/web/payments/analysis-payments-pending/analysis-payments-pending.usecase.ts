import { Injectable } from '@nestjs/common';
import { PaymentMethod, StatusPayment } from 'generated/prisma';
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
  isGuest: boolean;
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

    // Buscando pagamentos pendentes e totais em paralelo para otimizar a performance
    const [payments, total, totalPaymentInAnalysis, totalAmountInAnalysis] =
      await Promise.all([
        this.paymentGateway.findAllPaginated(
          event.getId(),
          safePage,
          safePageSize,
          {
            status: [StatusPayment.UNDER_REVIEW],
            methodPayment: [PaymentMethod.PIX],
          },
        ),
        this.paymentGateway.countAllFiltered(event.getId(), {
          status: [StatusPayment.UNDER_REVIEW],
          paymentMethod: [PaymentMethod.PIX],
        }),
        this.paymentGateway.countAllInAnalysis(event.getId()),
        this.paymentGateway.countTotalAmountInAnalysis(event.getId()),
      ]);

    const imagePath = await this.getPublicUrl(event.getImageUrl());

    const eventData: Event = {
      id: event.getId(),
      name: event.getName(),
      imageUrl: imagePath,
      paymentEnabled: event.getPaymentEnabled(),
      totalPaymentInAnalysis,
      totalAmountInAnalysis,
    };

    // Mapeando pagamentos e buscando informações dos responsáveis
    const paymentData = await Promise.all(
      payments.map(async (p) => {
        let responsible = 'Usuário não encontrado';

        // Se for guest, pega o nome do guest
        if (p.getIsGuest()) {
          responsible = p.getGuestName() || 'Convidado sem nome';
        }

        // Se não for guest, busca a conta associada
        const accountId = p.getAccountId();
        if (!p.getIsGuest() && accountId) {
          const account = await this.accountGateway.findById(accountId);
          responsible = account?.getUsername() || 'Usuário não encontrado';
        }

        return {
          id: p.getId(),
          responsible,
          status: p.getStatus(),
          isGuest: p.getIsGuest() || false,
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

  private async getPublicUrl(path?: string): Promise<string> {
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
