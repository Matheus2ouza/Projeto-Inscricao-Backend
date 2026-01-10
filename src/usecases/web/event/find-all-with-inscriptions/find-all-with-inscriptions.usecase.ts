import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllWithInscriptionsInput = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllWithInscriptionsOutput = {
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
  countInscriptions: number;
  countInscriptionsAnalysis: number;
  countSingleInscriptions: number;
  countSingleDebit: number;
}[];

@Injectable()
export class FindAllWithInscriptionsUsecase
  implements
    Usecase<FindAllWithInscriptionsInput, FindAllWithInscriptionsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllWithInscriptionsInput,
  ): Promise<FindAllWithInscriptionsOutput> {
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

    const eventsData = await Promise.all(
      allEvents.map(async (event) => {
        const imagePath = await this.getPublicImageUrl(event.getImageUrl());

        const [countInscriptions, countInscriptionsAnalysis] =
          await Promise.all([
            this.inscriptionGateway.countAllByEvent(event.getId()),
            this.inscriptionGateway.countAllInAnalysis(event.getId()),
          ]);

        const [countSingleInscriptions, countSingleDebit] = await Promise.all([
          this.onSiteRegistrationGateway.countAll(event.getId()),
          this.onSiteRegistrationGateway.countAllinDebt(event.getId()),
        ]);

        return {
          id: event.getId(),
          name: event.getName(),
          status: event.getStatus(),
          imageUrl: imagePath,
          startDate: event.getStartDate().toISOString(),
          endDate: event.getEndDate().toISOString(),
          countInscriptions,
          countInscriptionsAnalysis,
          countSingleInscriptions,
          countSingleDebit,
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
