import { statusEvent } from 'generated/prisma';

export type FindAllWithAccountRequest = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllWithAccountResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl?: string;
  status: statusEvent;
  startDate: Date;
  endDate: Date;
  countAccounts: number;
  countParticipants: number;
}[];
