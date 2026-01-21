import { StatusPayment } from 'generated/prisma';

export type RejectedPaymentRequest = {
  paymentId: string;
  rejectionReason: string;
};

export type RejectedPaymentResponse = {
  id: string;
  status: StatusPayment;
};
