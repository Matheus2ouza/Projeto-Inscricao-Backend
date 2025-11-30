import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListAllPaymentsInscriptionInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsInscriptionOutput = {
  paymentsInscriptions: PaymentsInscriptions;
  total: number;
  page: number;
  pageCount: number;
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
export class ListAllPaymentsInscriptionUsecase
  implements
    Usecase<ListAllPaymentsInscriptionInput, ListAllPaymentsInscriptionOutput>
{
  constructor(
    private readonly accountGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: ListAllPaymentsInscriptionInput,
  ): Promise<ListAllPaymentsInscriptionOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId} in ${ListAllPaymentsInscriptionUsecase.name}`,
        `Evento não encontrado`,
        ListAllPaymentsInscriptionUsecase.name,
      );
    }

    const [payments, total] = await Promise.all([
      this.paymentInscriptionGateway.findByEventIdWithPagination(
        safePage,
        safePageSize,
        {
          field: 'createdAt',
          direction: 'desc',
        },
        {
          eventId: event.getId(),
        },
      ),

      this.paymentInscriptionGateway.countAllFiltered({
        eventId: event.getId(),
      }),
    ]);

    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        let publicImageUrl: string | undefined;
        let approvedByName: string | undefined;
        const imagePath = payment.getImageUrl();
        const approvedBy = payment.getApprovedBy();

        if (imagePath) {
          try {
            publicImageUrl =
              await this.supabaseStorageService.getPublicUrl(imagePath);
          } catch (error) {
            publicImageUrl = undefined;
          }
        }

        const account = await this.accountGateway.findById(
          payment.getAccountId(),
        );

        if (approvedBy) {
          const approvedAccount =
            await this.accountGateway.findById(approvedBy);
          approvedByName = approvedAccount?.getUsername();
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
    const output: ListAllPaymentsInscriptionOutput = {
      paymentsInscriptions: enrichedPayments,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
    return output;
  }
}
