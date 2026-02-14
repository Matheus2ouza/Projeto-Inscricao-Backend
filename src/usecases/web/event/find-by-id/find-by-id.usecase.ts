import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

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
  image?: string;
  logoUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnebled: boolean;
  allowCard?: boolean;
  allowGuest: boolean;
  createdAt: Date;
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
    private readonly userGateway: AccountGateway,
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

    const imagePath = await this.getPublicUrl(event.getImageUrl());
    const logoPath = await this.getPublicUrl(event.getLogoUrl());

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
      image: imagePath,
      logoUrl: logoPath,
      location: event.getLocation(),
      longitude: event.getLongitude(),
      latitude: event.getLatitude(),
      status: event.getStatus(),
      paymentEnebled: event.getPaymentEnabled(),
      allowCard: event.getAllowCard() ?? false,
      allowGuest: event.getAllowGuest(),
      createdAt: event.getCreatedAt(),
      regionName: region?.getName() || '',
      responsibles: responsibleUsers,
    };

    return output;
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
