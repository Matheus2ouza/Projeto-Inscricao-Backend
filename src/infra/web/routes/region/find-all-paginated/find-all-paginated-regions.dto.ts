import { User } from 'src/domain/entities/user.entity';
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
    lastAccountAt: User | null;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
