import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListAllPaymentsInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsOutput = {
  groups: PaymentGroup[];
  totalDates: number;
  page: number;
  pageCount: number;
};

export type PaymentGroup = {
  date: string;
  payments: PaymentsInscriptions;
};

type PaymentsInscriptions = {
  id: string;
  accountName?: string;
  imageUrl?: string;
  value: number;
  status: StatusPayment;
  approvedBy?: string;
  createdAt: Date;
}[];

@Injectable()
export class ListAllPaymentsUsecase
  implements Usecase<ListAllPaymentsInput, ListAllPaymentsOutput>
{
  constructor(
    private readonly accountGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: ListAllPaymentsInput,
  ): Promise<ListAllPaymentsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const datesPerPage = Math.max(5, Math.floor(input.pageSize || 5));

    const event = await this.eventGateway.findById(input.eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        ListAllPaymentsUsecase.name,
      );
    }

    // 1. Buscar todas as datas distintas (ordenadas da mais recente para a mais antiga)
    const allDates =
      await this.paymentInscriptionGateway.findDistinctDatesByEventId(
        event.getId(),
      );

    const totalDates = allDates.length;
    const pageCount = Math.ceil(totalDates / datesPerPage);

    // 2. Selecionar o bloco de datas da página atual
    const start = (safePage - 1) * datesPerPage;
    const end = start + datesPerPage;

    const pageDates = allDates.slice(start, end); // ex: 5 datas

    // 3. Buscar todos os pagamentos de cada data
    const groups = await Promise.all(
      pageDates.map(async (date) => {
        const payments =
          await this.paymentInscriptionGateway.findByEventIdAndDate(
            event.getId(),
            date,
          );

        const enrichedPayments = await Promise.all(
          payments.map(async (payment) => {
            let publicImageUrl: string | undefined;
            let approvedByName: string | undefined;

            const imagePath = payment.getImageUrl();
            const approvedBy = payment.getApprovedBy();

            if (imagePath) {
              publicImageUrl =
                await this.supabaseStorageService.getPublicUrl(imagePath);
            }

            const account = await this.accountGateway.findById(
              payment.getAccountId(),
            );

            if (approvedBy) {
              const acc = await this.accountGateway.findById(approvedBy);
              approvedByName = acc?.getUsername();
            }

            return {
              id: payment.getId(),
              accountName: account?.getUsername(),
              imageUrl: publicImageUrl,
              value: Number(payment.getValue()),
              status: payment.getStatus(),
              approvedBy: approvedByName,
              createdAt: payment.getCreatedAt(),
            };
          }),
        );

        return {
          date,
          payments: enrichedPayments,
        };
      }),
    );

    return {
      groups,
      totalDates,
      page: safePage,
      pageCount,
    };
  }
}
