import { StatusPayment } from 'generated/prisma';

export type UpdatePaymentRequest = {
  paymentId: string;
  statusPayment: StatusPayment;
  rejectionReason?: string;
};

export type UpdatePaymentResponse = {
  id: string;
  status: string;
};
