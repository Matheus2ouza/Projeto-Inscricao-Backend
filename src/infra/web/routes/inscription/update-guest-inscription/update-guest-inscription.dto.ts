export type UpdateGuestInscriptionRequest = {
  id: string;
  guestName?: string;
  guestEmail?: string;
  guestLocality?: string;
  phone?: string;
};

export type UpdateGuestInscriptionResponse = {
  id: string;
};
