import { Injectable } from '@nestjs/common';
import { CacheRecord } from 'src/domain/entities/cache-record.entity';
import { CacheRecordGateway } from 'src/domain/repositories/cache-record.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindCacheInput = {
  accountId: string;
  page: number;
  pageSize: number;
};

export type FindCacheOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  image: string;
  inscriptions: Inscriptions;
  countInscriptions: number;
}[];

export type Inscriptions = {
  responsible: string;
  email: string;
  phone: string;
  participants: Participants;
  totalValue: number;
  timeToExpiration: string;
}[];

export type Participants = {
  name: string;
  birthDateISO: string;
  gender: string;
  typeInscriptionId: string;
  typeInscription: string;
  value: number;
}[];

@Injectable()
export class FindCacheUsecase
  implements Usecase<FindCacheInput, FindCacheOutput>
{
  public constructor(
    private readonly cacheRecordGateway: CacheRecordGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  async execute(input: FindCacheInput): Promise<FindCacheOutput> {
    const page = Number.isFinite(input.page) ? Math.max(1, input.page) : 1;
    const pageSize = Number.isFinite(input.pageSize)
      ? Math.max(1, input.pageSize)
      : 10;

    const records =
      await this.cacheRecordGateway.findActiveByAccountId(input.accountId);

    const activeRecords = records.filter((record) => !record.isExpired());

    const total = activeRecords.length;
    const pageCount = total === 0 ? 0 : Math.ceil(total / pageSize);
    const currentPage = total === 0 ? 1 : Math.min(page, pageCount);
    const start = (currentPage - 1) * pageSize;
    const pageRecords = activeRecords.slice(start, start + pageSize);

    const events = await this.buildEventsResponse(pageRecords);

    return {
      events,
      total,
      page: currentPage,
      pageCount,
    };
  }

  private async buildEventsResponse(
    records: CacheRecord[],
  ): Promise<Events> {
    const eventIds = Array.from(
      new Set(
        records
          .map((record) => record.getPayload()?.eventId)
          .filter((eventId): eventId is string => Boolean(eventId)),
      ),
    );

    const eventsInfo = await this.fetchEventsInfo(eventIds);
    const eventsMap = new Map<string, Events[number]>();

    for (const record of records) {
      const payload = record.getPayload();
      const eventId: string | undefined = payload?.eventId;
      if (!eventId) continue;

      const meta = eventsInfo.get(eventId) ?? {
        name: 'Evento não encontrado',
        image: '',
      };

      const inscription = this.toInscription(record);

      const existing = eventsMap.get(eventId);
      if (existing) {
        existing.inscriptions.push(inscription);
        existing.countInscriptions = existing.inscriptions.length;
        continue;
      }

      eventsMap.set(eventId, {
        id: eventId,
        name: meta.name,
        image: meta.image,
        inscriptions: [inscription],
        countInscriptions: 1,
      });
    }

    return Array.from(eventsMap.values());
  }

  private async fetchEventsInfo(
    ids: string[],
  ): Promise<Map<string, { name: string; image: string }>> {
    const result = new Map<string, { name: string; image: string }>();

    await Promise.all(
      ids.map(async (eventId) => {
        const event = await this.eventGateway.findById(eventId);
        if (event) {
          result.set(eventId, {
            name: event.getName(),
            image: event.getImageUrl() ?? '',
          });
        }
      }),
    );

    return result;
  }

  private toInscription(record: CacheRecord): Inscriptions[number] {
    const payload = record.getPayload() ?? {};
    const participants = this.extractParticipants(payload);
    const totalValue = this.extractTotalValue(payload, participants);

    return {
      responsible: payload.responsible ?? '',
      email: payload.email ?? '',
      phone: payload.phone ?? '',
      participants,
      totalValue,
      timeToExpiration: this.formatTimeToExpiration(record.getExpiresAt()),
    };
  }

  private extractParticipants(payload: any): Participants {
    if (Array.isArray(payload?.items)) {
      return payload.items.map((item: any) => ({
        name: item.name ?? '',
        birthDateISO: item.birthDateISO ?? '',
        gender: item.gender ?? '',
        typeInscriptionId: item.typeInscriptionId ?? '',
        typeInscription: item.typeInscription ?? '',
        value: Number(item.value ?? 0),
      }));
    }

    if (payload?.participant) {
      const item = payload.participant;
      return [
        {
          name: item.name ?? '',
          birthDateISO: item.birthDateISO ?? item.birthDate ?? '',
          gender: item.gender ?? '',
          typeInscriptionId: item.typeInscriptionId ?? '',
          typeInscription: item.typeDescription ?? '',
          value: Number(item.value ?? 0),
        },
      ];
    }

    return [];
  }

  private extractTotalValue(payload: any, participants: Participants): number {
    if (payload?.total !== undefined) {
      const parsedTotal = Number(payload.total);
      if (!Number.isNaN(parsedTotal)) {
        return parsedTotal;
      }
    }

    if (payload?.participant?.value !== undefined) {
      const parsedParticipantValue = Number(payload.participant.value);
      if (!Number.isNaN(parsedParticipantValue)) {
        return parsedParticipantValue;
      }
    }

    return participants.reduce(
      (acc, participant) => acc + Number(participant.value ?? 0),
      0,
    );
  }

  private formatTimeToExpiration(expiresAt?: Date): string {
    if (!expiresAt) {
      return 'Sem expiração';
    }

    const diffMs = expiresAt.getTime() - Date.now();
    if (diffMs <= 0) {
      return 'Expirado';
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, '0'))
      .join(':');
  }
}
