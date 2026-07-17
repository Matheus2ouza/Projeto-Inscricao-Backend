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
import { ExclusiveInscriptionLinkNotFoundException } from '../../exceptions/exclusive-inscription-link/exclusive-inscription-link-not-found.usecase.exception';

export type PreviewExclusiveInscriptionLinkInput = {
  token: string;
};

export type PreviewExclusiveInscriptionLinkOutput = {
  event: Event;
  exclusiveInscriptionLink: ExclusiveInscriptionLink;
  status: 'valid' | 'inactive' | 'expired';
  canInscribe: boolean;
};

type Event = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  image: string;
};

type ExclusiveInscriptionLink = {
  token: string;
  active: boolean;
  expiresAt: Date;
  countInscriptions: number;
  typeInscriptions: TypeInscriptionAllowed[];
};

type TypeInscriptionAllowed = {
  id: string;
  description: string;
  value: number;
  rule: Date | null;
  specialType: boolean;
  participantLimit: number;
  currentCount: number;
};

@Injectable()
export class PreviewExclusiveInscriptionLinkUsecase
  implements
    Usecase<
      PreviewExclusiveInscriptionLinkInput,
      PreviewExclusiveInscriptionLinkOutput
    >
{
  constructor(
    private readonly exclusiveInscriptionLinkGateway: ExclusiveInscriptionLinkGateway,
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: PreviewExclusiveInscriptionLinkInput,
  ): Promise<PreviewExclusiveInscriptionLinkOutput> {
    const exclusiveLink =
      await this.exclusiveInscriptionLinkGateway.findByToken(input.token);

    // token inválido
    if (!exclusiveLink) {
      throw new ExclusiveInscriptionLinkNotFoundException(
        `Exclusive inscription link not found by token: ${input.token}`,
        'Link de inscrição não encontrado ou inválido.',
        PreviewExclusiveInscriptionLinkUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(exclusiveLink.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found for exclusive link. linkId: ${exclusiveLink.getId()}`,
        'Evento não encontrado.',
        PreviewExclusiveInscriptionLinkUsecase.name,
      );
    }

    const now = new Date();

    const isInactive = !exclusiveLink.getActive();
    const isExpired = exclusiveLink.getExpiresAt() < now;

    const status: 'valid' | 'inactive' | 'expired' = isInactive
      ? 'inactive'
      : isExpired
        ? 'expired'
        : 'valid';

    const canInscribe = status === 'valid';

    const imagePath = await this.getPublicUrlOrEmpty(event.getImageUrl());

    // busca tipos e contagens de inscrições de todos os links de uma vez
    const [typesByLink, countsByLink] = await Promise.all([
      this.typeInscriptionGateway.findByExclusiveLinkIdWithCount(
        exclusiveLink.getId(),
        event.getId(),
      ),
      this.inscriptionGateway.countByExclusiveLinkId(exclusiveLink.getId()),
    ]);

    return {
      event: {
        id: event.getId(),
        name: event.getName(),
        startDate: event.getStartDate(),
        endDate: event.getEndDate(),
        location: event.getLocation(),
        image: imagePath,
      },
      exclusiveInscriptionLink: {
        token: exclusiveLink.getToken(),
        active: exclusiveLink.getActive(),
        expiresAt: exclusiveLink.getExpiresAt(),
        countInscriptions: countsByLink,
        typeInscriptions: typesByLink.map((type) => ({
          id: type.getId(),
          description: type.getDescription(),
          value: type.getValue(),
          rule: type.getRule(),
          specialType: type.getSpecialType(),
          participantLimit: type.getParticipantLimit(),
          currentCount: type.currentCount,
        })),
      },
      status,
      canInscribe,
    };
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(
        path,
        IMAGE_PRESETS.mediumQuality,
        100,
      );
    } catch {
      return '';
    }
  }
}
