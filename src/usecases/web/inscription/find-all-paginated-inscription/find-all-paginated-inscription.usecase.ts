import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type FindAllPaginatedInscriptionInput = {
  eventId: string;
  localityId?: string;
  userId?: string;
  status: InscriptionStatus[];
  isGuest?: string | boolean;
  orderByCreatedAt?: 'asc' | 'desc';
  orderByResponsible?: 'asc' | 'desc';
  period?: 'all' | '1h' | '24h' | '7d' | '30d';
  responsible?: string;
  page: number;
  pageSize: number;
};

type PeriodFilter = NonNullable<FindAllPaginatedInscriptionInput['period']>;

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
    private readonly localityGateway: LocalityGateway,
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

    const localityIds = await this.seachLocalitiesToUser(
      input.userId,
      input.localityId,
    );

    let isGuest: boolean | undefined = undefined;
    if (input.isGuest === false) {
      isGuest = false;
    }

    const { startDate, endDate } = this.getDateRangeFromPeriod(input.period);

    const filters = {
      localityIds: localityIds,
      status: input.status,
      isGuest,
      orderByCreatedAt: input.orderByCreatedAt,
      orderByResponsible: input.orderByResponsible,
      startDate,
      endDate,
      responsible: input.responsible,
    };

    const [inscriptions, totalInscription] = await Promise.all([
      this.inscriptionGateway.findManyPaginated(
        event.getId(),
        safePage,
        safePageSize,
        filters,
      ),
      this.inscriptionGateway.countAll(event.getId(), filters),
    ]);

    // Contagem de participantes normais
    const totalParticipantsNormal =
      await this.accountParticipantInEventGateway.countParticipantsByEventId(
        event.getId(),
        localityIds,
      );

    let totalParticipantsGuest: number = 0;
    // Contagem de participantes de convidados
    if (isGuest) {
      totalParticipantsGuest =
        await this.participantGateway.countParticipantsByEventId(
          event.getId(),
          localityIds,
        );
    }

    // Total de participantes para retornar na resposta
    const totalParticipants = totalParticipantsNormal + totalParticipantsGuest;

    const [totalPaid, totalDue] = await Promise.all([
      this.inscriptionGateway.countTotalPaid(
        event.getId(),
        isGuest,
        localityIds,
      ),
      this.inscriptionGateway.countTotalDue(
        event.getId(),
        isGuest,
        localityIds,
      ),
    ]);

    const imagePath = await this.getPublicUrlOrEmpty(event.getImageUrl());

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
      totalParticipants,
      totalPaid,
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

  private async seachLocalitiesToUser(
    userId?: string,
    localityId?: string,
  ): Promise<string[]> {
    const localities = await this.localityGateway.findByAccountIdAndLocality(
      userId,
      localityId,
    );

    return localities.map((l) => l.getId());
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

  private getDateRangeFromPeriod(period?: PeriodFilter): {
    startDate?: string;
    endDate?: string;
  } {
    if (!period || period === 'all') {
      return {};
    }

    const now = new Date();
    const periodInMilliseconds: Record<Exclude<PeriodFilter, 'all'>, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const startDate = new Date(now.getTime() - periodInMilliseconds[period]);

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }
}
