export type UpdateInscriptionParam = {
  id: string;
};

export type UpdateInscriptionBody = {
  localityId?: string;
  name?: string;
  phone?: string;
  email?: string;
  observation?: string;
};

export type UpdateInscriptionResponse = {
  id: string;
};
