import { Injectable } from '@nestjs/common';
import { InscriptionMode, statusEvent } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { EventSlugNotFoundUsecaseException } from '../../exceptions/events/event-slug-not-found.usecase.exception';

export type FindBySlugEventInput = {
  slug: string;
};

export type FindBySlugEventOutput = {
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
  allowedInscriptionModes: InscriptionMode[];
  paymentEnebled: boolean;
  allowCard?: boolean;
  createdAt: Date;
  regionName: string;
  responsibles: Responsible[];
};

export type Responsible = {
  id: string;
  name: string;
};

@Injectable()
export class FindBySlugEventUsecase
  implements Usecase<FindBySlugEventInput, FindBySlugEventOutput>
{
  public constructor(
    private readonly eventSlugGateway: EventSlugGateway,
    private readonly eventGateway: EventGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly userGateway: AccountGateway,
    private readonly regionGateway: RegionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindBySlugEventInput,
  ): Promise<FindBySlugEventOutput> {
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

    const output: FindBySlugEventOutput = {
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
      allowedInscriptionModes: event.getAllowedInscriptionModes(),
      paymentEnebled: event.getPaymentEnabled(),
      allowCard: event.getAllowCard() ?? false,
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
