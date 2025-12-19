import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllWithAccountInput = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllWithAccountOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl?: string;
  status: statusEvent;
  startDate: Date;
  endDate: Date;
  countAccounts: number;
  countParticipants: number;
}[];

@Injectable()
export class FindAllWithAccountUsecase
  implements Usecase<FindAllWithAccountInput, FindAllWithAccountOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly accountGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllWithAccountInput,
  ): Promise<FindAllWithAccountOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 4)),
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

        const countAccounts =
          await this.accountGateway.countAccountsWithInscriptionsByEvent(
            event.getId(),
          );

        return {
          id: event.getId(),
          name: event.getName(),
          imageUrl: imagePath,
          status: event.getStatus(),
          startDate: event.getStartDate(),
          endDate: event.getEndDate(),
          countAccounts,
          countParticipants: event.getQuantityParticipants(),
        };
      }),
    );
    const output: FindAllWithAccountOutput = {
      events: eventsData,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
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
