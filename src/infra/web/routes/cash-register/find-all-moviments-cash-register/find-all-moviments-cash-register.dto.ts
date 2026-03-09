import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';

export type FindAllMovimentsCashRegisterRequest = {
  id: string;
  type?: CashEntryType | CashEntryType[];
  limitTime?: string;
  orderBy?: 'desc' | 'asc';
  page: number;
  pageSize: number;
};

export type FindAllMovimentsCashRegisterResponse = {
  moviments: Moviment[];
  totalMoviments: number;
  page: number;
  pageCount: number;
};

type Moviment = {
  id: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  responsible?: string;
  createdAt: Date;
};
