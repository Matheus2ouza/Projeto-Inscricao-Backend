export type CreatePaymentRequest = {
  eventId: string;
  accountId: string;
  totalValue: number;
  image: string;
  inscriptions: inscription[];
};

type inscription = {
  id: string;
};

export type CreatePaymentResponse = {
  id: string;
};
