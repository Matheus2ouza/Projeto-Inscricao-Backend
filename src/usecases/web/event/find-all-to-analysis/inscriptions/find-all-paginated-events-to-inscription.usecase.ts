import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedEventToInscriptionInput = {
  page: number;
  pageSize: number;
};

export type FindAllPaginatedEventToInscriptionOutput = {
  events: {
    id: string;
    name: string;
    imageUrl?: string;
    countInscriptions: number;
    countInscriptionsAnalysis: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class FindAllPaginatedEventToInscriptionUsecase
  implements
    Usecase<
      FindAllPaginatedEventToInscriptionInput,
      FindAllPaginatedEventToInscriptionOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllPaginatedEventToInscriptionInput,
  ): Promise<FindAllPaginatedEventToInscriptionOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    const allEvents = await this.eventGateway.findAll();

    const total = allEvents.length;

    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;
    const pageRegions = allEvents.slice(start, end);

    const enriched = await Promise.all(
      pageRegions.map(async (event: any) => {
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

        const countInscriptions = await this.inscriptionGateway.countAllByEvent(
          event.getId(),
        );

        const countInscriptionsAnalysis =
          await this.inscriptionGateway.countAllInAnalysis(event.getId());

        return {
          id: event.getId(),
          name: event.getName(),
          imageUrl: publicImageUrl,
          countInscriptions,
          countInscriptionsAnalysis,
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
