import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllToParticipantsInput = {
  page: number;
  pageSize: number;
};

export type FindAllToParticipantsOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl?: string;
  countInscriptions: number;
  countParticipants: number;
}[];

@Injectable()
export class FindAllToParticipantsUsecase
  implements Usecase<FindAllToParticipantsInput, FindAllToParticipantsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllToParticipantsInput,
  ): Promise<FindAllToParticipantsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    // Buscar eventos paginados e total
    const [allEvents, total] = await Promise.all([
      this.eventGateway.findAllPaginated(safePage, safePageSize),
      this.eventGateway.countAllFiltered({}),
    ]);

    const pageCount = Math.ceil(total / safePageSize);

    const enriched = await Promise.all(
      allEvents.map(async (event: any) => {
        let publicImageUrl: string | undefined = undefined;
        const imagePath = event.getImageUrl?.();
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

        const countParticipants =
          await this.participantGateway.countAllByEventId(event.getId());

        return {
          id: event.getId(),
          name: event.getName(),
          imageUrl: publicImageUrl,
          countInscriptions,
          countParticipants,
        };
      }),
    );

    return {
      events: enriched,
      total,
      page: safePage,
      pageCount,
    };
  }
}
