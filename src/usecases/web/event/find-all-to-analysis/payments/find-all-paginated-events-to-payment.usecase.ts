import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedEventToPaymentInput = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllPaginatedEventToPaymentOutput = {
  events: {
    id: string;
    name: string;
    status: string;
    imageUrl?: string;
    countPayments: number;
    countPaymentsAnalysis: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class FindAllPaginatedEventToPaymentUsecase
  implements
    Usecase<
      FindAllPaginatedEventToPaymentInput,
      FindAllPaginatedEventToPaymentOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllPaginatedEventToPaymentInput,
  ): Promise<FindAllPaginatedEventToPaymentOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    const [events, total] = await Promise.all([
      this.eventGateway.findAllPaginated(safePage, safePageSize, {
        status: input.status,
        regionId: input.regionId,
      }),
      this.eventGateway.countAllFiltered({
        status: input.status,
        regionId: input.regionId,
      }),
    ]);

    const enriched = await Promise.all(
      events.map(async (event: any) => {
        let publicImageUrl: string | undefined = undefined;
        const imagePath =
          event.getImageUrl?.() || event.imageUrl || event.imagePath;
        if (imagePath) {
          try {
            publicImageUrl =
              await this.supabaseStorageService.getPublicUrl(imagePath);
          } catch (e) {
            publicImageUrl = undefined;
          }
        }

        const countPayments =
          await this.paymentInscriptionGateway.countAllByEvent(event.getId());

        const countPaymentsAnalysis =
          await this.paymentInscriptionGateway.countAllInAnalysis(
            event.getId(),
          );

        return {
          id: event.getId(),
          name: event.getName(),
          status: event.getStatus(),
          imageUrl: publicImageUrl,
          countPayments,
          countPaymentsAnalysis,
        };
      }),
    );

    return {
      events: enriched,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }
}
