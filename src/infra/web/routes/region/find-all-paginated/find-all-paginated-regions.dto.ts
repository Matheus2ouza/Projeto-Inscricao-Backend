import { Account } from 'src/domain/entities/account.entity';
import { Event } from 'src/domain/entities/event.entity';

export type FindAllPaginatedRegionRequest = {
  page?: string;
  pageSize?: string;
};

export type EventWithImageUrl = Event & { imageUrl?: string };

export type FindAllPaginatedRegionResponse = {
  regions: {
    id: string;
    name: string;
    outstandingBalance: number;
    createdAt: Date;
    updatedAt: Date;
    lastEventAt: EventWithImageUrl | null;
    nextEventAt: EventWithImageUrl | null;
    lastAccountAt: Account | null;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
