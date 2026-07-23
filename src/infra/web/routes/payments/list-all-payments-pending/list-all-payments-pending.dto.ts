import { PaymentMode } from 'generated/prisma';

export type ListAllPaymentsPendingParam = {
  eventId: string;
};

export type ListAllPaymentsPendingQuery = {
  localityId?: string;
  page: number;
  pageSize: number;
};

export type ListAllPaymentsPendingResponse = {
  inscriptions: Inscriptions[];
  allowedPaymentModes: PaymentMode[];
  total: number;
  page: number;
  pageCount: number;
};

type Inscriptions = {
  id: string;
  totalValue: number;
  totalPaid: number;
  status: string;
  createAt: Date;
  canPay: boolean;
};
