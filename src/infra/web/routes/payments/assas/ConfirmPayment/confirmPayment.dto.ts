export type ConfirmPaymentRequest = {
  event: string;
  payment: PaymentData;
};

export type PaymentData = {
  id: string;
  checkoutSession: string;
  description: string;
  installmentNumber: number;
  value: number;
  netValue: number;
  confirmedDate: string;
};

export type ConfirmPaymentResponse = {
  id: string;
  status: string;
};
