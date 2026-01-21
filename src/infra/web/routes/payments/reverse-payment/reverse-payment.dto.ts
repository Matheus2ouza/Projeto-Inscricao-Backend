import { StatusPayment } from 'generated/prisma';

export type ReversePaymentRequest = {
  paymentId: string;
};

export type ReversePaymentResponse = {
  id: string;
  status: StatusPayment;
};
