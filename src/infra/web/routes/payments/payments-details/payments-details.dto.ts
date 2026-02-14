import { PaymentMethod } from 'generated/prisma';

export type PaymentsDetailsRequest = {
  paymentId: string;
};

export type PaymentsDetailsResponse = {
  id: string;
  status: string;
  isGuest: boolean;
  responsible: string;
  methodPayment: PaymentMethod;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string;
  rejectionReason?: string;
  allocations?: PaymentAllocation[];
  installments?: PaymentInstallment[];
};

type PaymentInstallment = {
  installmentNumber: number;
  value: number;
  netValue: number;
  paidAt?: Date;
  createdAt: Date;
};

type PaymentAllocation = {
  value: number;
  inscriptionId: string;
  responsible?: string;
};
