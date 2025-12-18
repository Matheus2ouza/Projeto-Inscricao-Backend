import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedEventToInscriptionInput = {
  regionId?: string;
  page: number;
  pageSize: number;
  status: statusEvent[];
};

export type FindAllPaginatedEventToInscriptionOutput = {
  events: {
    id: string;
    name: string;
    imageUrl?: string;
    status: statusEvent;
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
      events.map(async (e: any) => {
        const imagePath = await this.getPublicUrlOrEmpty(e.getImageUrl());

        const countInscriptions = await this.inscriptionGateway.countAllByEvent(
          e.getId(),
        );

        const countInscriptionsAnalysis =
          await this.inscriptionGateway.countAllInAnalysis(e.getId());

        return {
          id: e.getId(),
          name: e.getName(),
          imageUrl: imagePath,
          status: e.getStatus(),
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
