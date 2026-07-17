import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';
import {
  IMAGE_PRESETS,
  SupabaseStorageService,
} from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type FindDetailsEventInput = {
  eventId: string;
};

export type TypeInscription = {
  id: string;
  description: string;
  value: number;
  rule: Date | null;
  specialType: boolean;
};

export type FindDetailsEventOutput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnabled: boolean;
  regionName?: string;
  participanteConfig: ParticipantFieldsConfig;
};

@Injectable()
export class FindDetailsEventUsecase
  implements Usecase<FindDetailsEventInput, FindDetailsEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly regionGateway: RegionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(input: FindDetailsEventInput): Promise<FindDetailsEventOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId} in ${FindDetailsEventUsecase.name}`,
        `Evento não encontrado`,
        FindDetailsEventUsecase.name,
      );
    }

    //Busca a url da imagem do evento, caso tenha
    const imagePath = await this.getPublicUrl(event.getImageUrl());

    //Busca o nome da região
    const region = await this.regionGateway.findById(event.getRegionId());

    const output: FindDetailsEventOutput = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      image: imagePath,
      location: event.getLocation(),
      longitude: event.getLongitude(),
      latitude: event.getLatitude(),
      status: event.getStatus(),
      paymentEnabled: event.getPaymentEnabled(),
      regionName: region?.getName(),
      participanteConfig: event.getParticipantFieldsConfig(),
    };
    return output;
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
