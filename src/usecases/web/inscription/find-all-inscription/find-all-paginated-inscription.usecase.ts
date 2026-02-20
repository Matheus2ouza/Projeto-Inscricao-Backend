import { Injectable } from '@nestjs/common';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type FindAllPaginatedInscriptionInput = {
  eventId: string;
  userId?: string;
  isGuest?: boolean;
  orderBy?: 'asc' | 'desc';
  limitTime?: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedInscriptionOutput = {
  event: Event;
  total: number;
  page: number;
  pageCount: number;
};

export type Event = {
  id: string;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  totalInscription: number;
  totalGuestInscription?: number;
  totalParticipants: number;
  totalPaid: number;
  totalDue: number;
  inscriptions: Inscription[];
};

export type Inscription = {
  id: string;
  responsible: string;
  status: string;
  totalParticipant: number;
};

@Injectable()
export class FindAllPaginatedInscriptionsUsecase
  implements
    Usecase<FindAllPaginatedInscriptionInput, FindAllPaginatedInscriptionOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllPaginatedInscriptionInput,
  ): Promise<FindAllPaginatedInscriptionOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId}`,
        `Evento não encontrado`,
        FindAllPaginatedInscriptionsUsecase.name,
      );
    }

    const filters = {
      limitTime: input.limitTime,
      isGuest: input.isGuest,
      accountId: input.userId,
      orderBy: input.orderBy,
    };

    const [inscriptions, totalInscription, totalParticipants] =
      await Promise.all([
        this.inscriptionGateway.findManyPaginated(
          event.getId(),
          safePage,
          safePageSize,
          filters,
        ),
        this.inscriptionGateway.countAll(event.getId(), filters),
        this.accountParticipantInEventGateway.countParticipantsByEventId(
          event.getId(),
        ),
      ]);

    const totalGuestInscription =
      await this.participantGateway.countAllByEventId(event.getId());

    const imagePath = await this.getPublicUrlOrEmpty(event.getImageUrl());

    let totalDue = 0;
    const inscriptionData = await Promise.all(
      inscriptions.map(async (i) => {
        let totalParticipant: number | null = null;
        if (i.getIsGuest()) {
          totalParticipant = await this.participantGateway.countByInscriptionId(
            i.getId(),
          );
        }

        if (!i.getIsGuest()) {
          totalParticipant =
            await this.accountParticipantInEventGateway.countByInscriptionId(
              i.getId(),
            );
        }

        totalDue +=
          Number(i.getTotalValue() ?? 0) - Number(i.getTotalPaid() ?? 0);
        return {
          id: i.getId(),
          responsible: i.getResponsible(),
          status: i.getStatus(),
          isGuest: i.getIsGuest(),
          totalParticipant: totalParticipant ?? 0,
        };
      }),
    );

    const eventData: Event = {
      id: event.getId(),
      name: event.getName(),
      image: imagePath,
      startDate: event.getStartDate().toISOString(),
      endDate: event.getEndDate().toISOString(),
      totalInscription,
      totalGuestInscription,
      totalParticipants,
      totalPaid: event.getAmountCollected(),
      totalDue,
      inscriptions: inscriptionData,
    };

    const output: FindAllPaginatedInscriptionOutput = {
      event: eventData,
      total: totalInscription,
      page: safePage,
      pageCount: Math.ceil(totalInscription / safePageSize),
    };

    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
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
