import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account.entity';
import { Event } from 'src/domain/entities/event.entity';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { EventWithImageUrl } from 'src/infra/web/routes/region/find-all-paginated/find-all-paginated-regions.dto';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedRegionsInput = {
  page: number;
  pageSize: number;
};

export type FindAllPaginatedRegionsOutput = {
  regions: {
    id: string;
    name: string;
    outstandingBalance: number;
    createdAt: Date;
    updatedAt: Date;
    numberOfEvents?: number;
    numberOfAccounts?: number;
    lastEventAt: EventWithImageUrl | null;
    nextEventAt: EventWithImageUrl | null;
    lastAccountAt: Account | null;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class FindAllPaginatedRegionsUsecase
  implements
    Usecase<FindAllPaginatedRegionsInput, FindAllPaginatedRegionsOutput>
{
  public constructor(
    private readonly regionGateway: RegionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAllPaginatedRegionsInput,
  ): Promise<FindAllPaginatedRegionsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    const allRegions = await this.regionGateway.findAll();
    const total = allRegions.length;

    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;
    const pageRegions = allRegions.slice(start, end);

    const enriched = await Promise.all(
      pageRegions.map(async (region) => {
        const [lastEvent, nextEvent, lastAccount] = await Promise.all([
          this.regionGateway.lastEventAt(region.getId()),
          this.regionGateway.nextEventAt(region.getId()),
          this.regionGateway.lastAccountAt(region.getId()),
        ]);

        // Função auxiliar para enriquecer o evento com a URL pública da imagem
        const enrichEventWithImageUrl = async (
          event: Event | null,
        ): Promise<EventWithImageUrl | null> => {
          if (event && typeof event.getImageUrl === 'function') {
            const imageName = event.getImageUrl();
            if (imageName) {
              let imageUrl = imageName;
              try {
                imageUrl =
                  await this.supabaseStorageService.getPublicUrl(imageName);
              } catch (e) {
                // Se falhar, mantém o nome original
              }
              // Extrai os campos relevantes do evento
              return {
                id: event.getId(),
                name: event.getName(),
                quantityParticipants: event.getQuantityParticipants(),
                amountCollected: event.getAmountCollected(),
                startDate: event.getStartDate(),
                endDate: event.getEndDate(),
                imageUrl,
                createdAt: event.getCreatedAt(),
                updatedAt: event.getUpdatedAt(),
                regionId: event.getRegionId(),
              } as EventWithImageUrl;
            }
          }
          return event as EventWithImageUrl | null;
        };

        const [lastEventWithUrl, nextEventWithUrl] = await Promise.all([
          enrichEventWithImageUrl(lastEvent),
          enrichEventWithImageUrl(nextEvent),
        ]);

        return {
          id: region.getId(),
          name: region.getName(),
          outstandingBalance: region.getOutstandingBalance(),
          createdAt: region.getCreatedAt(),
          updatedAt: region.getUpdatedAt(),
          numberOfEvents:
            typeof region.getNumberOfEvents === 'function'
              ? region.getNumberOfEvents()
              : undefined,
          numberOfAccounts:
            typeof region.getNumberOfAccounts === 'function'
              ? region.getNumberOfAccounts()
              : undefined,
          lastEventAt: lastEventWithUrl,
          nextEventAt: nextEventWithUrl,
          lastAccountAt: lastAccount,
        };
      }),
    );

    const pageCount = Math.max(1, Math.ceil(total / safePageSize));

    return {
      regions: enriched,
      total,
      page: safePage,
      pageCount,
    };
  }
}
