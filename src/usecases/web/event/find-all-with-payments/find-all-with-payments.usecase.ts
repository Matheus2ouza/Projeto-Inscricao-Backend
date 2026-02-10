import { Usecase } from 'src/usecases/usecase';

import { EventGateway } from 'src/domain/repositories/event.gateway';

import { Injectable } from '@nestjs/common';
import { roleType, statusEvent } from 'generated/prisma';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';

export type FindAllWithPaymentsInput = {
  regionId?: string;
  role?: roleType;
  paymentEnabled?: boolean;
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
  status: statusEvent;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  paymentEnabled?: boolean;
  totalPayments?: number;
  totalDebt?: number;
  countPaymentsAnalysis?: number;
  amountCollected?: number;
}[];

@Injectable()
export class FindAllWithPaymentsUsecase
  implements Usecase<FindAllWithPaymentsInput, FindAllWithPaymentsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
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
        paymentEnabled: input.paymentEnabled,
        regionId: input.regionId,
      }),
      this.eventGateway.countAllFiltered({
        paymentEnabled: input.paymentEnabled,
        regionId: input.regionId,
      }),
    ]);

    const events = await Promise.all(
      allEvents.map(async (e) => {
        const imagePath = await this.getPublicUrlOrEmpty(e.getImageUrl());

        if (input.role === roleType.USER) {
          return {
            id: e.getId(),
            name: e.getName(),
            imageUrl: imagePath,
            status: e.getStatus(),
            startDate: e.getStartDate(),
            endDate: e.getEndDate(),
            location: e.getLocation(),
            paymentEnabled: e.getPaymentEnabled(),
          };
        }
        const totalPayments = await this.paymentGateway.countAllByEventId(
          e.getId(),
        );

        const countPaymentsAnalysis =
          await this.paymentGateway.countAllInAnalysis(e.getId());

        const totalDebt = await this.paymentGateway.countTotalAmountInAnalysis(
          e.getId(),
        );

        return {
          id: e.getId(),
          name: e.getName(),
          imageUrl: imagePath,
          status: e.getStatus(),
          startDate: e.getStartDate(),
          endDate: e.getEndDate(),
          location: e.getLocation(),
          amountCollected: e.getAmountCollected(),
          paymentEnabled: e.getPaymentEnabled(),
          totalPayments: totalPayments,
          totalDebt: totalDebt,
          countPaymentsAnalysis: countPaymentsAnalysis,
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
