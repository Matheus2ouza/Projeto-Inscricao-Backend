export type CreateTypeInscriptionRequest = {
  description: string;
  value: number;
  eventId: string;
  specialtype: boolean;
};

export type CreateTypeInscriptionResponse = {
  id: string;
};
