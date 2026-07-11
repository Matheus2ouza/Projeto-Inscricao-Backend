import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { CreateSlugEventUsecase } from '../create-slug/create-slug-event.usecase';

export type FindAllPaginatedEventsInput = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllPaginatedEventsOutput = {
  events: {
    id: string;
    name: string;
    quantityParticipants: number;
    amountCollected: number;
    startDate: Date;
    endDate: Date;
    url: string;
    imageUrl?: string;
    location: string;
    longitude?: number | null;
    latitude?: number | null;
    status: statusEvent;
    createdAt: Date;
    regionName?: string;
    countTypeInscriptions: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class FindAllPaginatedEventsUsecase
  implements Usecase<FindAllPaginatedEventsInput, FindAllPaginatedEventsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly regionGateway: RegionGateway,
    private readonly eventSlugGateway: EventSlugGateway,
    private readonly createSlugEventUsecase: CreateSlugEventUsecase,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAllPaginatedEventsInput,
  ): Promise<FindAllPaginatedEventsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    // Buscar eventos filtrados e paginados diretamente do banco
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
        const imagePath = await this.getPublicUrlOrEmpty(event.getImageUrl());

        const countTypeIncriptions =
          await this.eventGateway.countTypesInscriptions(event.getId());

        const region = await this.regionGateway.findById(event.getRegionId());

        const url = await this.getEventUrl(event);

        return {
          id: event.getId(),
          name: event.getName(),
          quantityParticipants: event.getQuantityParticipants(),
          amountCollected: event.getAmountCollected(),
          startDate: event.getStartDate(),
          endDate: event.getEndDate(),
          url,
          imageUrl: imagePath,
          location: event.getLocation() || event.location || '',
          longitude: event.getLongitude?.() ?? event.longitude ?? null,
          latitude: event.getLatitude?.() ?? event.latitude ?? null,
          status: event.getStatus(),
          createdAt: event.getCreatedAt(),
          updatedAt: event.getUpdatedAt(),
          regionName: region?.getName(),
          countTypeInscriptions: countTypeIncriptions,
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

  private async getEventUrl(event: Event): Promise<string> {
    let currentSlug = await this.eventSlugGateway.findByEventId(event.getId());

    if (!currentSlug) {
      currentSlug = await this.createSlugEventUsecase.execute({
        eventId: event.getId(),
        eventName: event.getName(),
      });
    }

    const baseUrl = process.env.APP_URL;

    return `${baseUrl}/events/${currentSlug?.getSlug()}`;
  }
}
