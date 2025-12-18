import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllWithExpensesInput = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllWithExpensesOutPut = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl: string;
  status: string;
  startDate: string;
  endDate: string;
  countExpenses: number;
  countTotalExpenses: number;
}[];

@Injectable()
export class FindAllWithExpensesUsecase
  implements Usecase<FindAllWithExpensesInput, FindAllWithExpensesOutPut>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllWithExpensesInput,
  ): Promise<FindAllWithExpensesOutPut> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const [events, total] = await Promise.all([
      this.eventGateway.findAllPaginated(safePage, safePageSize, {
        regionId: input.regionId,
        status: input.status,
      }),
      this.eventGateway.countAllFiltered({
        regionId: input.regionId,
        status: input.status,
      }),
    ]);

    const eventsData = await Promise.all(
      events.map(async (event) => {
        const imagePath = await this.getPublicImageUrl(event.getImageUrl());

        const [countExpenses, countTotalExpenses] = await Promise.all([
          this.eventExpensesGateway.countAll(event.getId()),
          this.eventExpensesGateway.countTotalExpense(event.getId()),
        ]);

        return {
          id: event.getId(),
          name: event.getName(),
          status: event.getStatus(),
          imageUrl: imagePath,
          startDate: event.getStartDate().toISOString(),
          endDate: event.getEndDate().toISOString(),
          countExpenses,
          countTotalExpenses,
        };
      }),
    );

    return {
      events: eventsData,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }

  private async getPublicImageUrl(path?: string): Promise<string> {
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
