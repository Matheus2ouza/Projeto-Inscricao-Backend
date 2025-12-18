import { statusEvent } from 'generated/prisma';

export type FindAllPaginatedEventToInscriptionRequest = {
  page?: number;
  pageSize?: number;
  status: statusEvent[];
};

export type FindAllPaginatedEventToInscriptionResponse = {
  events: {
    id: string;
    name: string;
    imageUrl?: string;
    status: statusEvent;
    countInscriptions: number;
    countInscriptionsAnalysis: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
