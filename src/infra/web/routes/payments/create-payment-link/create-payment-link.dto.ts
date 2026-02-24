export type CreatePaymentLinkRequest = {
  inscriptionId: string;
};

export type CreatePaymentLinkResponse = {
  url: string;
  active: boolean;
};
