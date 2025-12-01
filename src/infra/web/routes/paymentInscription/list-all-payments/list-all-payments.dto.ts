import { StatusPayment } from 'generated/prisma';

export type ListAllPaymentsRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsResponse = {
  paymentsInscriptions: PaymentsInscriptions;
  total: number;
  page: number;
  pageCount: number;
};

type PaymentsInscriptions = {
  id: string;
  accountName?: string;
  imageUrl?: string;
  value: number;
  status: StatusPayment;
  approvedBy?: string;
  createdAt: Date;
}[];
