import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type FindByIdEventInput = {
  id: string;
};

export type FindByIdEventOutput = {
  id: string;
  name: string;
  quantityParticipants: number;
  amountCollected: number;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnebled: boolean;
  createdAt: Date;
  updatedAt: Date;
  regionName: string;
  responsibles: Responsible[];
};

export type Responsible = {
  id: string;
  name: string;
};

@Injectable()
export class FindByIdEventUsecase
  implements Usecase<FindByIdEventInput, FindByIdEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: UserGateway,
    private readonly regionGateway: RegionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindByIdEventInput,
  ): Promise<FindByIdEventOutput> {
    const event = await this.eventGateway.findById(input.id);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.id} in ${FindByIdEventUsecase.name}`,
        `Evento não encontrado`,
        FindByIdEventUsecase.name,
      );
    }

    const region = await this.regionGateway.findById(event.getRegionId());

    let publicImageUrl: string | undefined = undefined;
    if (event.getImageUrl) {
      const imagePath = event.getImageUrl();
      if (imagePath) {
        publicImageUrl =
          await this.supabaseStorageService.getPublicUrl(imagePath);
      }
    }

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

    const output: FindByIdEventOutput = {
      id: event.getId(),
      name: event.getName(),
      quantityParticipants: event.getQuantityParticipants(),
      amountCollected: event.getAmountCollected(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      imageUrl: publicImageUrl,
      location: event.getLocation(),
      longitude: event.getLongitude(),
      latitude: event.getLatitude(),
      status: event.getStatus(),
      paymentEnebled: event.getPaymentEnabled(),
      createdAt: event.getCreatedAt(),
      updatedAt: event.getUpdatedAt(),
      regionName: region?.getName() || '',
      responsibles: responsibleUsers,
    };

    return output;
  }
}
