export type FindTypeInscriptionByEventRequest = {
  eventId: string;
};

export type FindTypeInscriptionByEventResponse = {
  id: string;
  description: string;
  value: number;
  rule: Date | null;
  specialType: boolean;
  active?: boolean;
  participantLimit?: number;
  limitIsStrict?: boolean;
  createdAt?: Date;
}[];
