export type FindPaymentsDatesRequest = {
  regionId: string;
};

export type FindPaymentsDatesResponse = {
  eventId: string;
  paymentId: string;
  installmentNumber: number;
  received: boolean;
  value: number;
  netValue: number;
  estimatedAt: Date;
}[];
