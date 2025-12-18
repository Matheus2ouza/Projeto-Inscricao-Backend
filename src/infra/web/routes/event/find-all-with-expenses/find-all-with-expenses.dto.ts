import { statusEvent } from 'generated/prisma';

export type FindAllWithExpensesRequest = {
  regionId?: string;
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllWithExpensesResponse = {
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
  countExpenses: number;
  countTotalExpenses: number;
}[];
