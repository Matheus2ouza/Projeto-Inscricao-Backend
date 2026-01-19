import { StatusPayment } from 'generated/prisma';

export type ListAllPaymentsRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsResponse = {
  groups: PaymentGroup[];
  totalDates: number;
  page: number;
  pageCount: number;
};

export type PaymentGroup = {
  date: string;
  payments: PaymentsInscriptions;
};

export type PaymentsInscriptions = {
  id: string;
  accountName?: string;
  imageUrl?: string;
  value: number;
  status: StatusPayment;
  approvedBy?: string;
  createdAt: Date;
}[];
