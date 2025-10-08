import { statusEvent } from 'generated/prisma';

export type FindAllPaginatedEventsRequest = {
  page?: number;
  pageSize?: number;
};

export type FindAllPaginatedEventResponse = {
  events: {
    id: string;
    name: string;
    quantityParticipants: number;
    amountCollected: number;
    startDate: Date;
    endDate: Date;
    imageUrl?: string;
    location: string;
    longitude?: number | null;
    latitude?: number | null;
    status: statusEvent;
    createdAt: Date;
    updatedAt: Date;
    regionName: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
