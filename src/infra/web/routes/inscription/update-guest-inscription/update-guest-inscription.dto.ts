export type UpdateGuestInscriptionRequest = {
  id: string;
  localityId?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export type UpdateGuestInscriptionResponse = {
  id: string;
};
