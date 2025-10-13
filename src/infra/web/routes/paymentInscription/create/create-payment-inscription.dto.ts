export type CreatePaymentInscriptionRequest = {
  inscriptionId: string;
  value: number;
  image: string;
};

export type CreatePaymentInscriptionResponse = {
  id: string;
};
