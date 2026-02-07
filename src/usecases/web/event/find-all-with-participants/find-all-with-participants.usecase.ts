import { Injectable } from '@nestjs/common';
import { InscriptionStatus, statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllWithParticipantsInput = {
  regionId?: string;
  status?: statusEvent[];
  guest: boolean;
  page: number;
  pageSize: number;
};

export type FindAllWithParticipantsOutput = {
  events: Events[];
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
  countParticipants: number;
  countParticipantsInAnalysis: number;
};

@Injectable()
export class FindAllWithParticipantsUsecase
  implements
    Usecase<FindAllWithParticipantsInput, FindAllWithParticipantsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllWithParticipantsInput,
  ): Promise<FindAllWithParticipantsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(8, Math.floor(input.pageSize || 8)),
    );

    const [allevents, total] = await Promise.all([
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
      allevents.map(async (e) => {
        const imagePath = await this.getPublicImageUrl(e.getImageUrl());

        const [countParticipants, countParticipantsInAnalysis] =
          await Promise.all([
            this.inscriptionGateway.countParticipantsByEventId(
              e.getId(),
              input.guest,
            ),
            this.inscriptionGateway.countParticipantsByEventId(
              e.getId(),
              input.guest,
              [InscriptionStatus.PENDING, InscriptionStatus.UNDER_REVIEW],
            ),
          ]);

        return {
          id: e.getId(),
          name: e.getName(),
          imageUrl: imagePath,
          status: e.getStatus(),
          startDate: e.getStartDate().toISOString(),
          endDate: e.getEndDate().toISOString(),
          countParticipants,
          countParticipantsInAnalysis,
        };
      }),
    );
    const output: FindAllWithParticipantsOutput = {
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
