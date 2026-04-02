export type UpdateInscriptionParam = {
  id: string;
};

export type UpdateInscriptionBody = {
  responsible?: string;
  phone?: string;
  email?: string;
  observation?: string;
};

export type UpdateInscriptionResponse = {
  id: string;
};
