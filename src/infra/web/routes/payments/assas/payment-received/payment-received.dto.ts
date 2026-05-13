export type PaymentReceivedRequest = {
  id: string;
  dateCreated: string;
  event: string;
  payment: PaymentData;
};

export type PaymentData = {
  id: string;
  checkoutSession: string | null;
  billingType: string;
  description: string | null;
  installmentNumber: number | null;
  value: number;
  netValue: number;
  confirmedDate: string | null;
  estimatedCreditDate: string | null;
};

export type PaymentReceivedResponse = {
  status: string;
  message: string;
};
