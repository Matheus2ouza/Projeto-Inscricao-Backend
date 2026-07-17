import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import {
  IMAGE_PRESETS,
  SupabaseStorageService,
} from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindAllExclusiveInscriptionLinkInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type FindAllExclusiveInscriptionLinkOutput = {
  event: Event;
  exclusiveInscriptionLinks: ExclusiveInscriptionLink[];
  total: number;
  page: number;
  pageCount: number;
};

type Event = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  countExckusiveInscriptionLinks: number;
  countExckusiveInscriptionLinksEnabled: number;
  countExckusiveInscriptionLinksDisabled: number;
};

type ExclusiveInscriptionLink = {
  id: string;
  name: string;
  token: string;
  expiresAt: Date;
  active: boolean;
  countInscriptions: number;
  typeInscriptionAllowed: TypeInscriptionAllowed[];
};

type TypeInscriptionAllowed = {
  id: string;
  description: string;
  value: number;
  specialType: boolean;
  rule?: Date;
  active: boolean;
  participantLimit: number;
  limitIsStrict: boolean;
  currentCount: number;
};

@Injectable()
export class FindAllExclusiveInscriptionLinkUsecase
  implements
    Usecase<
      FindAllExclusiveInscriptionLinkInput,
      FindAllExclusiveInscriptionLinkOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly exclusiveInscriptionLinkGateway: ExclusiveInscriptionLinkGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllExclusiveInscriptionLinkInput,
  ): Promise<FindAllExclusiveInscriptionLinkOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    // valida se o evento existe
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempting to find exclusive inscription links for event with id ${input.eventId}, but it was not found.`,
        `Nenhum evento encontrado`,
        FindAllExclusiveInscriptionLinkUsecase.name,
      );
    }

    // cria o filtro para buscar os links de inscrição
    const filters = { eventId: input.eventId };

    const [exclusiveInscriptionLinksArray, total] = await Promise.all([
      this.exclusiveInscriptionLinkGateway.findPaginated(
        filters,
        safePage,
        safePageSize,
      ),
      this.exclusiveInscriptionLinkGateway.countAll(filters),
    ]);

    const linkIds = exclusiveInscriptionLinksArray.map((l) => l.getId());

    // busca tipos e contagens de inscrições de todos os links de uma vez
    const [typesByLink, countsByLink] = await Promise.all([
      this.typeInscriptionGateway.findByExclusiveLinkIdsWithCount(
        linkIds,
        input.eventId,
      ),
      this.inscriptionGateway.countByExclusiveLinkIds(linkIds),
    ]);

    const exclusiveInscriptionLinks = exclusiveInscriptionLinksArray.map(
      (link) => ({
        id: link.getId(),
        name: link.getName(),
        token: link.getToken(),
        expiresAt: link.getExpiresAt(),
        active: link.getActive(),
        countInscriptions: countsByLink[link.getId()] ?? 0,
        typeInscriptionAllowed: (typesByLink[link.getId()] ?? []).map(
          (type) => ({
            id: type.getId(),
            description: type.getDescription(),
            value: type.getValue(),
            specialType: type.getSpecialType(),
            rule: type.getRule() ?? undefined,
            active: type.getActive(),
            participantLimit: type.getParticipantLimit(),
            limitIsStrict: type.getLimitIsStrict(),
            currentCount: type.currentCount,
          }),
        ),
      }),
    );

    // busca a imagem do evento no supabase
    const imagePath = await this.getPublicUrlOrEmpty(event.getImageUrl());

    // monta o objeto de resposta do evento com as contagens de links de inscrição
    const eventData: Event = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      image: imagePath,
      countExckusiveInscriptionLinks: total,
      countExckusiveInscriptionLinksEnabled: exclusiveInscriptionLinks.filter(
        (link) => link.active,
      ).length,
      countExckusiveInscriptionLinksDisabled: exclusiveInscriptionLinks.filter(
        (link) => !link.active,
      ).length,
    };

    const output: FindAllExclusiveInscriptionLinkOutput = {
      event: eventData,
      exclusiveInscriptionLinks,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
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
