import { Usecase } from 'src/usecases/usecase';

import { EventGateway } from 'src/domain/repositories/event.gateway';

import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';

export type FindAllWithTicketsInput = {
  regionId?: string;
  page: number;
  pageSize: number;
};

export type FindAllWithTicketsOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  ticketEnabled: boolean;
}[];

@Injectable()
export class FindAllWithTicketsUsecase
  implements Usecase<FindAllWithTicketsInput, FindAllWithTicketsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAllWithTicketsInput,
  ): Promise<FindAllWithTicketsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const [allEvents, total] = await Promise.all([
      this.eventGateway.findAllPaginated(safePage, safePageSize, {
        status: ['OPEN', 'CLOSE', 'FINALIZED'],
        regionId: input.regionId,
      }),
      this.eventGateway.countAllFiltered({
        status: ['OPEN', 'CLOSE', 'FINALIZED'],
        regionId: input.regionId,
      }),
    ]);

    const events = await Promise.all(
      allEvents.map(async (event) => {
        // Obter URL pública da imagem
        let publicImageUrl = '';
        const imagePath = event.getImageUrl();
        if (imagePath) {
          try {
            publicImageUrl =
              await this.supabaseStorageService.getPublicUrl(imagePath);
          } catch {
            publicImageUrl = '';
          }
        }

        return {
          id: event.getId(),
          name: event.getName(),
          imageUrl: publicImageUrl,
          startDate: event.getStartDate().toISOString(),
          endDate: event.getEndDate().toISOString(),
          ticketEnabled: event.getTicketEnabled() || false,
        };
      }),
    );

    const output: FindAllWithTicketsOutput = {
      events,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }
}
