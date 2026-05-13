export type CreateTypeInscriptionParam = {
  eventId: string;
};

export type CreateTypeInscriptionBody = {
  description: string;
  value: number;
  rule: Date | null;
  eventId: string;
  specialType: boolean;
  participantLimit: number;
  limitIsStrict: boolean;
};

export type CreateTypeInscriptionResponse = {
  id: string;
};
