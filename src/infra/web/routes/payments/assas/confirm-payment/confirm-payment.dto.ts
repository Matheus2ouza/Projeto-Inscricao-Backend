export type ConfirmPaymentRequest = {
  event: string;
  payment: PaymentData;
};

export type PaymentData = {
  id: string;
  checkoutSession: string;
  description: string | null;
  installmentNumber: number | null;
  value: number;
  netValue: number;
  confirmedDate: string;
  estimatedCreditDate: string;
};

export type ConfirmPaymentResponse = {
  id: string;
  status: string;
};
