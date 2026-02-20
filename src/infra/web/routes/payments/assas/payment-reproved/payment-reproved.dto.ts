export type PaymentReprovedRequest = {
  checkoutSession: string;
  externalReference: string;
};

export type PaymentReprovedResponse = {
  status: string;
  message: string;
};
