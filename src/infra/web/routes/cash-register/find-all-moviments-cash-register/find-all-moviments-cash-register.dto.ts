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
  totalIncome: number;
  totalExpense: number;
  page: number;
  pageCount: number;
};

type Moviment = {
  id: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  responsible?: string;
  imageUrl?: string;
  createdAt: Date;
};
