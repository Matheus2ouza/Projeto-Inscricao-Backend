import { Injectable } from '@nestjs/common';
import { Event } from 'src/domain/entities/event/event.entity';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import {
  IMAGE_PRESETS,
  SupabaseStorageService,
} from 'src/infra/services/supabase/supabase-storage.service';
import { CreateSlugEventUsecase } from '../create-slug/create-slug-event.usecase';

export type FindEventCarouselOutput = {
  id: string;
  name: string;
  location?: string;
  image?: string;
  url: string;
}[];

@Injectable()
export class FindEventCarouselUsecase {
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventSlugGateway: EventSlugGateway,
    private readonly createSlugEventUsecase: CreateSlugEventUsecase,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(): Promise<FindEventCarouselOutput> {
    const events = await this.eventGateway.findAllCarousel();

    const eventsData: FindEventCarouselOutput = await Promise.all(
      events.map(async (event) => {
        const imagePath = await this.getPublicUrl(event.getImageUrl());

        const url = await this.getEventUrl(event);

        return {
          id: event.getId(),
          name: event.getName(),
          location: event.getLocation(),
          image: imagePath,
          url,
        };
      }),
    );

    return eventsData;
  }

  private async getEventUrl(event: Event): Promise<string> {
    let currentSlug = await this.eventSlugGateway.findByEventId(event.getId());

    if (!currentSlug) {
      currentSlug = await this.createSlugEventUsecase.execute({
        eventId: event.getId(),
        eventName: event.getName(),
      });
    }

    const baseUrl = process.env.APP_URL;

    return `${baseUrl}/events/${currentSlug?.getSlug()}`;
  }

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(
        path,
        IMAGE_PRESETS.thumbnail,
        100,
      );
    } catch {
      return '';
    }
  }
}
