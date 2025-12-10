import { Usecase } from 'src/usecases/usecase';

import { EventGateway } from 'src/domain/repositories/event.gateway';

import { Injectable } from '@nestjs/common';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';

export type FindAllWithPaymentsInput = {
  regionId?: string;
  page: number;
  pageSize: number;
};

export type FindAllWithPaymentsOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

type Events = {
  id: string;
  name: string;
  imageUrl: string;
  status: string;
  totalPayments: number;
  totalDebt: number;
}[];

@Injectable()
export class FindAllWithPaymentsUsecase
  implements Usecase<FindAllWithPaymentsInput, FindAllWithPaymentsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAllWithPaymentsInput,
  ): Promise<FindAllWithPaymentsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const [allEvents, total] = await Promise.all([
      this.eventGateway.findAllPaginated(safePage, safePageSize, {
        status: ['OPEN', 'FINALIZED'],
        regionId: input.regionId,
      }),
      this.eventGateway.countAllFiltered({
        status: ['OPEN', 'FINALIZED'],
        regionId: input.regionId,
      }),
    ]);

    const events = await Promise.all(
      allEvents.map(async (events) => {
        const imagePath = await this.getPublicUrlOrEmpty(events.getImageUrl());
        const totalPayments =
          await this.paymentInscriptionGateway.countAllByEventId(
            events.getId(),
          );

        return {
          id: events.getId(),
          name: events.getName(),
          imageUrl: imagePath,
          status: events.getStatus(),
          totalPayments,
          totalDebt: events.getAmountCollected(),
        };
      }),
    );

    const output: FindAllWithPaymentsOutput = {
      events,
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
