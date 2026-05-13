export type FindTypeInscriptionByEventRequest = {
  eventId: string;
};

export type FindTypeInscriptionByEventResponse = {
  id: string;
  description: string;
  rule: Date | null;
  value: number;
  specialType: boolean;
  active: boolean;
  participantLimit: number;
  limitIsStrict: boolean;
  createdAt: Date;
}[];
