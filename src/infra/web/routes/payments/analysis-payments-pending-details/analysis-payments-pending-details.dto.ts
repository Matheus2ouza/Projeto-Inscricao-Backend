import { PaymentMethod } from 'generated/prisma';

export type AnalysisPaymentsPendingDetailsRequest = {
  paymentId: string;
};

export type AnalysisPaymentsPendingDetailsResponse = {
  id: string;
  status: string;
  methodPayment: PaymentMethod;
  totalValue: number;
  createdAt: Date;
  imageUrl: string;
  rejectionReason?: string;
  allocation?: PaymentAllocation[];
};

type PaymentAllocation = {
  value: number;
  inscriptionId: string;
};
