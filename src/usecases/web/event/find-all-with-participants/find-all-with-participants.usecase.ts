import { Injectable } from '@nestjs/common';
import { InscriptionStatus, roleType, statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllWithParticipantsInput = {
  regionId?: string;
  role: roleType;
  status?: statusEvent[];
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
  location?: string;
  countParticipants: number;
  countParticipantsGuest?: number;
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

    const [eventsArray, total] = await Promise.all([
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
      eventsArray.map(async (e) => {
        const imagePath = await this.getPublicImageUrl(e.getImageUrl());

        const countParticipants =
          await this.inscriptionGateway.countParticipantsByEventId(e.getId(), {
            isGuest: false,
            status: InscriptionStatus.PAID,
          });

        let countParticipantsGuest: number | undefined = undefined;
        if (input.role !== 'USER') {
          countParticipantsGuest =
            await this.inscriptionGateway.countParticipantsByEventId(
              e.getId(),
              { isGuest: true, status: InscriptionStatus.PAID },
            );
        }
        return {
          id: e.getId(),
          name: e.getName(),
          imageUrl: imagePath,
          status: e.getStatus(),
          startDate: e.getStartDate().toISOString(),
          endDate: e.getEndDate().toISOString(),
          location: e.getLocation(),
          countParticipants,
          countParticipantsGuest,
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
