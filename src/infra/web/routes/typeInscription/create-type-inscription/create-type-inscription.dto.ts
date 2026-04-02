export type CreateTypeInscriptionRequest = {
  description: string;
  value: number;
  rule: Date | null;
  eventId: string;
  specialType: boolean;
};

export type CreateTypeInscriptionResponse = {
  id: string;
};
