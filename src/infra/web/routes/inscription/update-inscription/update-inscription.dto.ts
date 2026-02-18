export type UpdateInscriptionRequest = {
  id: string;
  responsible?: string;
  phone?: string;
  email?: string;
};

export type UpdateInscriptionResponse = {
  id: string;
};
