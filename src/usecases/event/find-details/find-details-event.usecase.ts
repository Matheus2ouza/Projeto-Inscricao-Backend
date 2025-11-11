import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma/client';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type FindDetailsEventInput = {
  eventId: string;
};

export type TypeInscription = {
  description: string;
  value: number;
};

export type FindDetailsEventOutput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnabled: boolean;
  regionName?: string;
  typeInscriptions: TypeInscription[];
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

    //Busca os tipos de inscrição referente ao evento
    const typeInscription = await this.typeInscriptionGateway.findByEventId(
      event.getId(),
    );

    //Mapeia para retornar somente a descriçao e o valor
    const typeInscriptions = typeInscription.map((type) => ({
      description: type.getDescription(),
      value: type.getValue(),
    }));

    //Busca a url da imagem do evento, caso tenha
    let publicImageUrl: string | undefined = undefined;
    if (event.getImageUrl) {
      const imagePath = event.getImageUrl();
      if (imagePath) {
        publicImageUrl =
          await this.supabaseStorageService.getPublicUrl(imagePath);
      }
    }

    //Busca o nome da região
    const region = await this.regionGateway.findById(event.getRegionId());

    const output: FindDetailsEventOutput = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      imageUrl: publicImageUrl,
      location: event.getLocation(),
      longitude: event.getLongitude(),
      latitude: event.getLatitude(),
      status: event.getStatus(),
      paymentEnabled: event.getPaymentEnabled(),
      regionName: region?.getName(),
      typeInscriptions,
    };
    return output;
  }
}
