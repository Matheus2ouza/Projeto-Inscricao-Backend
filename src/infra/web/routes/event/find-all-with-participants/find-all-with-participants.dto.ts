import { statusEvent } from 'generated/prisma';

export type FindAllWithParticipantsRequest = {
  regionId?: string;
  status?: statusEvent[];
  guest: boolean;
  page: number;
  pageSize: number;
};

export type FindAllWithParticipantsResponse = {
  events: Events[];
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
  countParticipants: number;
  countParticipantsInAnalysis: number;
};
