import { PaymentMode } from 'generated/prisma';

export type UpdatePaymentModeEventParam = {
  id: string;
};

export type UpdatePaymentModeEventBody = {
  paymentMode: PaymentMode[];
};

export type UpdatePaymentModeEventResponse = {
  message: 'modified';
  paymentMode: PaymentMode[];
};
