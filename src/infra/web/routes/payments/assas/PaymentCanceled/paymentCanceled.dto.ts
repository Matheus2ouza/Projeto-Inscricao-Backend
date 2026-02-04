export type PaymentCanceledRequest = {
  checkoutSession: string;
  externalReference: string;
};

export type PaymentCanceledResponse = {
  status: string;
  message: string;
};
