export type PaymentReceivedRequest = {
  id: string;
  dateCreated: string;
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

export type PaymentReceivedResponse = {
  status: string;
  message: string;
};
