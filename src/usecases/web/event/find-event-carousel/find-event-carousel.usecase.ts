import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';

export type FindEventCarouselOutput = {
  id: string;
  name: string;
  location: string;
  image: string;
}[];

@Injectable()
export class FindEventCarouselUsecase {
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(): Promise<FindEventCarouselOutput> {
    const events = await this.eventGateway.findAllCarousel();

    const enriched = await Promise.all(
      events.map(async (event) => {
        let publicImageUrl = '';
        if (event.imageUrl) {
          try {
            publicImageUrl = await this.supabaseStorageService.getPublicUrl(
              event.imageUrl,
            );
          } catch (e) {
            publicImageUrl = '';
          }
        }

        return {
          id: event.id,
          name: event.name,
          location: event.location,
          image: publicImageUrl,
        };
      }),
    );

    return enriched;
  }
}
