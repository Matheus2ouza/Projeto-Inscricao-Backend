import { StatusPayment } from 'generated/prisma';

export type ListAllPaymentsInscriptionRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsInscriptionResponse = {
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
