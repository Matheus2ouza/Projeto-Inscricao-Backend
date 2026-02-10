import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';

export type FindEventCarouselOutput = {
  id: string;
  name: string;
  location?: string;
  image?: string;
}[];

@Injectable()
export class FindEventCarouselUsecase {
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(): Promise<FindEventCarouselOutput> {
    const events = await this.eventGateway.findAllCarousel();

    const eventsData: FindEventCarouselOutput = await Promise.all(
      events.map(async (event) => {
        const imagePath = await this.getPublicUrl(event.getImageUrl());

        return {
          id: event.getId(),
          name: event.getName(),
          location: event.getLocation(),
          image: imagePath,
        };
      }),
    );

    return eventsData;
  }

  private async getPublicUrl(path?: string): Promise<string> {
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
