import { Usecase } from 'src/usecases/usecase';

import { EventGateway } from 'src/domain/repositories/event.gateway';

import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';

export type FindAllWithTicketsInput = {
  regionId?: string;
  status?: statusEvent[];
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
  status: statusEvent;
  imageUrl: string;
  logoUrl: string;
  startDate: string;
  endDate: string;
  ticketEnabled?: boolean;
  countTickets: number;
  countSaleTickets: number;
}[];

@Injectable()
export class FindAllWithTicketsUsecase
  implements Usecase<FindAllWithTicketsInput, FindAllWithTicketsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
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
        status: input.status,
        regionId: input.regionId,
      }),
      this.eventGateway.countAllFiltered({
        status: input.status,
        regionId: input.regionId,
      }),
    ]);

    const events = await Promise.all(
      allEvents.map(async (event) => {
        const imagePath = await this.getPublicImageUrl(event.getImageUrl());
        const logoPath = await this.getPublicImageUrl(event.getLogoUrl());

        const [countTickets, countSaleTickets] = await Promise.all([
          this.eventTicketsGateway.countByEventId(event.getId()),
          this.ticketSaleGateway.countSalesByEventId(event.getId()),
        ]);

        return {
          id: event.getId(),
          name: event.getName(),
          status: event.getStatus(),
          imageUrl: imagePath,
          logoUrl: logoPath,
          startDate: event.getStartDate().toISOString(),
          endDate: event.getEndDate().toISOString(),
          ticketEnabled: event.getTicketEnabled(),
          countTickets,
          countSaleTickets,
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
