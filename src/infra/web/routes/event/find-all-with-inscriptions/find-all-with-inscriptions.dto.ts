import { statusEvent } from 'generated/prisma';

export type FindAllWithInscriptionsRequest = {
  page: number;
  pageSize: number;
  status?: statusEvent[];
};

export type FindAllWithInscriptionsResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl: string;
  status: string;
  startDate: string;
  endDate: string;
  countInscriptions: number;
  countInscriptionsAnalysis: number;
  countSingleInscriptions: number;
  countSingleDebit: number;
}[];
