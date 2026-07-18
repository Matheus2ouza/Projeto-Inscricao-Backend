import { Injectable } from '@nestjs/common';
import { InscriptionMode, statusEvent } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { RedisService } from 'src/infra/services/redis/redis.service';
import {
  IMAGE_PRESETS,
  SupabaseStorageService,
} from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { EventSlugNotFoundUsecaseException } from '../../exceptions/events/event-slug-not-found.usecase.exception';

export type FindBySlugEventInput = {
  slug: string;
};

export type FindBySlugEventOutput = {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  image?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  allowedInscriptionModes: InscriptionMode[];
  createdAt: Date | string;
  regionName: string;
};

@Injectable()
export class FindBySlugEventUsecase
  implements Usecase<FindBySlugEventInput, FindBySlugEventOutput>
{
  private readonly CACHE_TTL = 900; // 15min
  private readonly CACHE_KEY_PREFIX = 'event:slug:';

  public constructor(
    private readonly eventSlugGateway: EventSlugGateway,
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: AccountGateway,
    private readonly regionGateway: RegionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly redis: RedisService,
  ) {}

  public async execute(
    input: FindBySlugEventInput,
  ): Promise<FindBySlugEventOutput> {
    const cacheKey = this.getCacheKey(input.slug);

    // primeiro tenta buscar no cache
    const cachedResult = await this.getFromCache(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // caso não tenha sucesso em pegar no cache então busca no banco
    const eventSlug = await this.eventSlugGateway.findBySlug(input.slug);

    if (!eventSlug) {
      throw new EventSlugNotFoundUsecaseException(
        `attempt to fetch the event by a slug, but the slug is invalid. slug: ${input.slug}`,
        `Nenhum evento encontrado`,
        FindBySlugEventUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(eventSlug.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${eventSlug.getId()} in ${FindBySlugEventUsecase.name}`,
        `Evento não encontrado`,
        FindBySlugEventUsecase.name,
      );
    }

    const region = await this.regionGateway.findById(event.getRegionId());

    const imagePath = await this.getPublicUrl(event.getImageUrl());

    const responsibles = await this.eventResponsibleGateway.findByEventId(
      event.getId(),
    );

    const responsibleUsers = await Promise.all(
      responsibles.map(async (responsible) => {
        const user = await this.userGateway.findById(
          responsible.getAccountId(),
        );
        return {
          id: responsible.getAccountId(),
          name: user?.getUsername() || 'Usuário não encontrado',
        };
      }),
    );

    const output: FindBySlugEventOutput = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      image: imagePath,
      location: event.getLocation(),
      longitude: event.getLongitude(),
      latitude: event.getLatitude(),
      status: event.getStatus(),
      allowedInscriptionModes: event.getAllowedInscriptionModes(),
      createdAt: event.getCreatedAt(),
      regionName: region?.getName() || '',
    };

    // salva o resultado no cache
    await this.saveToCache(cacheKey, output);

    return output;
  }

  private async saveToCache(
    cachekey: string,
    data: FindBySlugEventOutput,
  ): Promise<void> {
    try {
      await this.redis.setJson(cachekey, data, this.CACHE_TTL);
    } catch (error) {
      // Se falhar ao salvar no cache, apenas loga o erro mas não interrompe
      console.error(
        FindBySlugEventUsecase.name,
        'Falha ao tentar salvar em cache os dados do evento',
        error,
      );
    }
  }

  private async getFromCache(
    cachekey: string,
  ): Promise<FindBySlugEventOutput | null> {
    try {
      const cached = await this.redis.getJson<FindBySlugEventOutput>(cachekey);

      return cached;
    } catch (error) {
      return null;
    }
  }

  private getCacheKey(slug: string): string {
    return `${this.CACHE_KEY_PREFIX}${slug}`;
  }

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(
        path,
        IMAGE_PRESETS.logo,
        100,
      );
    } catch {
      return '';
    }
  }
}
