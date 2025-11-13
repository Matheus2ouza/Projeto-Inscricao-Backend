import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedEventsInput = {
  status?: string[];
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
    imageUrl?: string;
    location: string;
    longitude?: number | null;
    latitude?: number | null;
    status: statusEvent;
    createdAt: Date;
    updatedAt: Date;
    regionName: string;
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
      this.eventGateway.findAllFiltered({
        status: input.status,
        page: safePage,
        pageSize: safePageSize,
      }),
      this.eventGateway.countAllFiltered({
        status: input.status,
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

        const countTypeIncriptions =
          await this.eventGateway.countTypesInscriptions(event.getId());

        return {
          id: event.getId(),
          name: event.getName(),
          quantityParticipants: event.getQuantityParticipants(),
          amountCollected: event.getAmountCollected(),
          startDate: event.getStartDate(),
          endDate: event.getEndDate(),
          imageUrl: publicImageUrl,
          location: event.getLocation() || event.location || '',
          longitude: event.getLongitude?.() ?? event.longitude ?? null,
          latitude: event.getLatitude?.() ?? event.latitude ?? null,
          status: event.getStatus(),
          createdAt: event.getCreatedAt(),
          updatedAt: event.getUpdatedAt(),
          regionName: event.region?.name || '',
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
}
